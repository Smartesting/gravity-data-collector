import { v4 as uuidv4 } from 'uuid'
import IEventHandler from '../event/handler/IEventHandler'
import { ConsoleEventHandler } from '../event/handler/ConsoleEventHandler'
import ClickEventListener from '../event/listener/ClickEventListener'
import { createSessionEvent } from '../event/event'
import { CollectorOptions } from '../types'
import ChangeEventListener from '../event/listener/ChangeEventListener'

class CollectorWrapper {
  readonly eventHandler: IEventHandler

  constructor(authKey: string,
    options?: CollectorOptions,
    private readonly window: Window = global.window) {
    const sessionId = uuidv4()

    this.eventHandler = new ConsoleEventHandler(authKey, sessionId, console.debug.bind(console), options)

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
}

export default CollectorWrapper
