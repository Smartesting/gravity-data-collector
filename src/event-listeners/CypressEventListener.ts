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
      })
    }
  }

  init(): void {
    for (const [cypressEvent, listener] of Array.from(this.listeners.entries())) {
      if (!this.cypress.listeners(cypressEvent).includes(listener)) this.cypress.addListener(cypressEvent, listener)
    }
  }

  terminate(): void {
    for (const [cypressEvent, listener] of Array.from(this.listeners.entries())) {
      this.cypress.removeListener(cypressEvent, listener)
    }
  }
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

function skipEvent(event: any): boolean {
  return ['then', 'wrap', 'task'].includes(event.attributes.name)
}
