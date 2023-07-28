import { CypressCommand, CypressEvent, CypressObject, UserActionType } from '../types'
import { IEventListener } from './IEventListener'
import location from '../utils/location'
import gravityDocument from '../utils/gravityDocument'
import viewport from '../utils/viewport'
import IUserActionHandler from '../user-action/IUserActionHandler'

export default class CypressEventListener implements IEventListener {
  private readonly listeners: Map<CypressEvent, any> = new Map()

  constructor(private readonly cypress: CypressObject, private readonly userActionHandler: IUserActionHandler) {
    for (const cypressEvent of Object.values(CypressEvent)) {
      this.listeners.set(cypressEvent, (event: any) => {
        this.registerCypressEvent(cypressEvent, event)
      })
    }
  }

  init(): void {
    for (const [cypressEvent, listener] of Array.from(this.listeners.entries())) {
      this.cypress.addListener(cypressEvent, listener)
    }
  }

  terminate(): void {
    for (const [cypressEvent, listener] of Array.from(this.listeners.entries())) {
      this.cypress.removeListener(cypressEvent, listener)
    }
  }

  private registerCypressEvent(cypressEvent: CypressEvent, event: any) {
    if (skipEvent(event)) {
      return
    }
    this.userActionHandler.handle({
      type: UserActionType.TestCommand,
      command: extractCypressCommand(cypressEvent, event),
      document: gravityDocument(),
      location: location(),
      recordedAt: new Date().toISOString(),
      viewportData: viewport(),
    })
  }
}

function skipEvent(cmd: any) {
  if (cmd.attributes === undefined) return true
  const { name } = cmd.attributes
  if (name === 'task') return true
  return name === 'then'
}

function extractCypressCommand(eventType: CypressEvent, event: any): CypressCommand {
  const { name, args, id, chainerId, prev, next, type, userInvocationStack } = event.attributes
  return {
    name,
    args,
    id,
    chainerId,
    event: eventType,
    type,
    prevId: prev?.attributes?.id,
    nextId: next?.attributes?.id,
    userInvocationStack,
  }
}
