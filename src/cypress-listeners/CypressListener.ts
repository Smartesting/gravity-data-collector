import { IEventListener } from '../event-listeners-handler/IEventListener'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { CypressObject, EventProviderKey, IEventHandler } from '../types'
import NopEventHandler from '../event-handlers/NopEventHandler'

export class CypressListener implements IEventListener {
  private readonly listener: (...values: any[]) => void

  constructor(
    private readonly cypress: CypressObject & CyEventEmitter,
    private readonly cypressEvent: string,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly eventHandler: IEventHandler = new NopEventHandler(),
  ) {
    const provider = { id: EventProviderKey.CYPRESS, version: cypress.version }
    this.listener = (event: any) => {
      this.eventHandler.handle(provider, cypressEvent, event)
    }
  }

  init(): void {
    this.cypress.addListener(this.cypressEvent, this.listener)
  }

  terminate(): void {
    this.cypress.removeListener(this.cypressEvent, this.listener)
  }
}
