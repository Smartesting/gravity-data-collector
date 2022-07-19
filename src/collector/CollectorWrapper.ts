import { v4 as uuidv4 } from 'uuid'
import IEventHandler from '../event/handler/IEventHandler'
import { ConsoleEventHandler } from '../event/handler/ConsoleEventHandler'
import ClickEventListener from '../event/listener/ClickEventListener'
import { createSessionEvent } from '../event/createSessionEvent'
import { CollectorOptions, ConsoleEventHandlerOptions, GravityEventHandlerOptions } from '../types'
import ChangeEventListener from '../event/listener/ChangeEventListener'
import { GravityEventHandler } from '../event/handler/GravityEventHandler'
import UnloadEventListener from '../event/listener/UnloadEventListener'

class CollectorWrapper {
  readonly eventHandler: IEventHandler

  constructor(options: CollectorOptions, private readonly window: Window) {
    const sessionId = uuidv4()

    this.eventHandler = options.debug
      ? createConsoleHandler(sessionId, options as ConsoleEventHandlerOptions)
      : createGravityHandler(sessionId, options as GravityEventHandlerOptions)

    this.initSession()
    this.initializeEventHandlers()
  }

  private initSession() {
    return this.eventHandler.run(createSessionEvent())
  }

  private initializeEventHandlers() {
    new ClickEventListener(this.eventHandler, this.window).init()
    new ChangeEventListener(this.eventHandler, this.window).init()
    new UnloadEventListener(this.eventHandler, this.window).init()
  }
}

function createConsoleHandler(sessionId: string, options: ConsoleEventHandlerOptions) {
  return new ConsoleEventHandler(sessionId, console.debug.bind(console), options)
}

function createGravityHandler(sessionId: string, options: GravityEventHandlerOptions): IEventHandler {
  if (options.authKey === undefined) throw new Error('No AuthKey was specified')
  return new GravityEventHandler(sessionId, options)
}

export default CollectorWrapper
