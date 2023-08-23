import { CypressCommand, CypressEvent, CypressObject, UserActionType } from '../types'
import { IEventListener } from './IEventListener'
import location from '../utils/location'
import gravityDocument from '../utils/gravityDocument'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { ListenerFn } from 'eventemitter2'

export default class CypressEventListener implements IEventListener {
  private readonly listeners: Map<CypressEvent, ListenerFn> = new Map()
  private readonly testAfterRunListener: (event: any) => void

  constructor(private readonly cypress: CypressObject, private readonly userActionHandler: IUserActionHandler) {
    this.testAfterRunListener = () => {
      console.log('[test:after:run] userActionHandler.flush()')
      this.userActionHandler.flush()
    }
    for (const cypressEvent of Object.values(CypressEvent)) {
      this.listeners.set(cypressEvent, (event: any) => {
        this.userActionHandler.handle({
          type: UserActionType.TestCommand,
          command: extractCypressCommand(cypressEvent, event),
          document: gravityDocument(),
          location: location(),
          recordedAt: new Date().toISOString(),
          viewportData: {},
        })
      })
    }
  }

  init(): void {
    for (const [cypressEvent, listener] of Array.from(this.listeners.entries())) {
      if (!this.cypress.listeners(cypressEvent).includes(listener)) this.cypress.addListener(cypressEvent, listener)
    }
    this.cypress.addListener('test:after:run', this.testAfterRunListener)
  }

  terminate(): void {
    this.cypress.removeListener('test:after:run', this.testAfterRunListener)
    for (const [cypressEvent, listener] of Array.from(this.listeners.entries())) {
      this.cypress.removeListener(cypressEvent, listener)
    }
  }
}

function extractCypressCommand(eventType: CypressEvent, event: any): CypressCommand {
  const { name, args, id, chainerId, prev, next, type, userInvocationStack } = event.attributes
  return {
    name,
    args: lightenArguments(args),
    id,
    chainerId,
    event: eventType,
    type,
    prevId: prev?.attributes?.id,
    nextId: next?.attributes?.id,
    userInvocationStack,
  }
}

function lightenArguments(args: any): any {
  const length = JSON.stringify(args ?? '').length
  if (length > 255) return [`Gravity Collector replaced these too long args (${length} chars)`]
  return args
}
