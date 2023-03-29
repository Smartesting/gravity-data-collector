import {
  CypressCommand,
  CypressObject,
  EventData,
  EventProvider,
  EventProviderKey,
  IEventHandler,
  TestStep,
  UserAction,
} from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

export default class CypressTestEventReporter implements IEventHandler {
  private lines: string[] = []

  constructor(
    private readonly cypress: CypressObject,
    private readonly reporterFilename: string,
    private readonly sessionIdHandler: ISessionIdHandler,
  ) {}

  handle(provider: EventProvider, eventType: string, event: any): void {
    switch (provider.id) {
      case EventProviderKey.GRAVITY:
        this.registerGravityEvent(provider, event as UserAction)
        break
      case EventProviderKey.CYPRESS:
        this.registerCypressEvent(provider, eventType, event)
        break
    }
  }

  private registerCypressEvent(provider: EventProvider, eventType: string, event: any) {
    if (eventType === 'test:after:run') {
      console.log(`write ${this.lines.length}  lines in file ${this.reporterFilename}`)
      ;(this.cypress as any).cy.writeFile(this.reporterFilename, '\n' + this.lines.join('\n') + '\n', {
        flag: 'a+',
      })
      this.lines = []
      return
    }

    if (skipEvent(event)) return

    const testStep: TestStep | undefined = lookupTestStep(this.cypress)
    const data = extractCypressCommand(event, this.cypress.currentTest.titlePath, testStep)
    const reporterData: EventData = {
      sessionId: this.sessionIdHandler.get(),
      provider,
      type: eventType,
      data,
      recordedAt: new Date(),
    }
    this.lines.push(JSON.stringify(reporterData))
  }

  private registerGravityEvent(provider: EventProvider, action: UserAction) {
    const reporterData: EventData = {
      provider,
      type: action.type,
      data: action,
      recordedAt: new Date(action.recordedAt ?? new Date()),
      initiatedAt: action.initiatedAt === undefined ? undefined : new Date(action.initiatedAt),
      sessionId: this.sessionIdHandler.get(),
    }
    this.lines.push(JSON.stringify(reporterData))
  }
}

function skipEvent(cmd: any) {
  if (cmd.attributes === undefined) return true
  const { name, type } = cmd.attributes
  if (name === 'task') return true
  if (name === 'then') return true
  return type === undefined
}

function extractCypressCommand(
  event: any,
  testPath: readonly string[],
  testStep: TestStep | undefined,
): CypressCommand {
  const { name, args, id, chainerId, type, fn, prev, next, userInvocationStack } = event.attributes
  return {
    name,
    args,
    id,
    chainerId,
    type,
    code: fn.toString(),
    prevId: prev?.attributes?.id,
    nextId: next?.attributes?.id,
    testPath,
    userInvocationStack,
    testStep,
  }
}

function lookupTestStep(cypress: CypressObject): TestStep | undefined {
  // @ts-expect-error
  const mocha = cypress.mocha
  if (mocha === undefined) return undefined
  const runner = mocha.getRunner()
  if (runner === undefined) return undefined
  const currentRunnable = runner.currentRunnable
  if (currentRunnable === undefined) return undefined
  const currentRunnerCommands = currentRunnable.commands ?? []
  for (let i = currentRunnerCommands.length - 1; i >= 0; i--) {
    const { name, displayName, message, state } = currentRunnerCommands[i]
    if (name === 'step') {
      return { displayName, message, state }
    }
  }
  return undefined
}
