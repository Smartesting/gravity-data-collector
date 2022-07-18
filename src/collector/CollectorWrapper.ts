import { v4 as uuidv4 } from 'uuid'
import IEventHandler from '../event/handler/IEventHandler'
import { ConsoleEventHandler } from '../event/handler/ConsoleEventHandler'
import ClickEventListener from '../event/listener/ClickEventListener'
import { createSessionEvent } from '../event/createSessionEvent'
import { CollectorOptions, ConsoleEventHandlerOptions, GravityEventHandlerOptions } from '../types'
import ChangeEventListener from '../event/listener/ChangeEventListener'

class CollectorWrapper {
  readonly eventHandler: IEventHandler

  constructor(options: CollectorOptions, private readonly window: Window) {
    const sessionId = uuidv4()

    this.eventHandler = options.debug
      ? this.createConsoleHandler(sessionId, options as ConsoleEventHandlerOptions)
      : this.createGravityHandler(sessionId, options as GravityEventHandlerOptions)

    this.initSession()
    this.initializeEventHandlers()
  }

  private initSession() {
    const event = createSessionEvent()
    return this.eventHandler.run(event)
  }

  private initializeEventHandlers() {
    new ClickEventListener(this.eventHandler, this.window).init()
    new ChangeEventListener(this.eventHandler, this.window).init()
  }

  private createConsoleHandler(sessionId: string, options: ConsoleEventHandlerOptions) {
    return new ConsoleEventHandler(sessionId, console.debug.bind(console), options)
  }

  private createGravityHandler(sessionId: string, options: GravityEventHandlerOptions): IEventHandler {
    if (options.authKey === undefined) throw new Error('No AuthKey was specified')

    // TODO: instanciate real handler
    throw new Error('Not implemented yet')
  }
}

export default CollectorWrapper
