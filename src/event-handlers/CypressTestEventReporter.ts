import {
  CypressCommand,
  CypressObject,
  EventProvider,
  EventProviderKey,
  IEventHandler,
  SessionEvent,
  TestStep,
  UserAction,
} from '../types'
import { TestStepFinder } from './TestStepFinder'
import { buildCucumberTestStepFinder } from './cucumberTestStepFinder'

export default class CypressTestEventReporter implements IEventHandler {
  private eventBuffer: SessionEvent[] = []
  private readonly testStepFinders: TestStepFinder[] = []

  constructor(
    private readonly cypress: CypressObject,
    private readonly sessionId: string,
    private readonly eventOutput: (sessionEvents: readonly SessionEvent[]) => void,
  ) {
    const cucumberFinder = buildCucumberTestStepFinder(cypress)
    if (cucumberFinder != null) {
      this.testStepFinders.push(cucumberFinder)
    }
  }

  handle(provider: EventProvider, eventType: string, event: any): void {
    switch (provider.id) {
      case EventProviderKey.GRAVITY:
        // console.log('[Gravity] ', eventType, event)
        this.registerGravityEvent(provider, event as UserAction)
        break
      case EventProviderKey.CYPRESS:
        // console.log('[Cypress] ', eventType, event)
        this.registerCypressEvent(provider, eventType, event)
        break
    }
  }

  private registerCypressEvent(provider: EventProvider, eventType: string, event: any) {
    if (eventType === 'test:after:run') {
      const count = this.eventBuffer.length
      if (count === 0) return

      // const filename = (this.eventBuffer[count - 1].data as CypressCommand).testPath.join('__')
      // console.log(`writing ${count} lines in file ${filename}`)
      batch(this.eventBuffer, 20, (events) => {
        // const content = '\n' + events.map((e) => JSON.stringify(e)).join('\n') + '\n'
        // const cy = (this.cypress as any).cy
        // cy.writeFile(filename, content, { flag: 'a+' })
        this.eventOutput(events)
      })

      this.eventBuffer = []
      return
    }

    if (skipEvent(event)) return

    const testStep: TestStep | undefined = this.lookupTestStep(event)
    const data = extractCypressCommand(event, this.cypress.currentTest.titlePath, testStep)
    const reporterData: SessionEvent = {
      sessionId: this.sessionId,
      provider,
      type: eventType,
      data,
      recordedAt: new Date(),
    }
    this.eventBuffer.push(reporterData)
  }

  private registerGravityEvent(provider: EventProvider, action: UserAction) {
    const reporterData: SessionEvent = {
      provider,
      type: action.type,
      data: action,
      recordedAt: new Date(action.recordedAt ?? new Date()),
      initiatedAt: action.initiatedAt === undefined ? undefined : new Date(action.initiatedAt),
      sessionId: this.sessionId,
    }
    this.eventBuffer.push(reporterData)
  }

  private lookupTestStep(event: any): TestStep | undefined {
    for (const testStepFinder of this.testStepFinders) {
      const testStep = testStepFinder(event)
      if (testStep != null) return testStep
    }
    return undefined
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
  const { name, args, id, chainerId, type, prev, next, userInvocationStack } = event.attributes
  return {
    name,
    args,
    id,
    chainerId,
    type,
    prevId: prev?.attributes?.id,
    nextId: next?.attributes?.id,
    testPath,
    userInvocationStack,
    testStep,
  }
}

function batch(eventBuffer: SessionEvent[], batchSize: number, callback: (events: readonly SessionEvent[]) => void) {
  if (batchSize < 1) throw new Error('batch size cannot be lower than 1')
  let counter = 0
  while (counter < eventBuffer.length) {
    callback(eventBuffer.slice(counter, counter + batchSize))
    counter += batchSize
  }
}
