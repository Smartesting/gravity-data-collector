import { v4 as uuidv4 } from 'uuid'
import PointerUpEventListener from '../event/listener/PointerUpEventListener'
import { createSessionStartedEvent } from '../event/createSessionStartedEvent'
import { CollectorOptions } from '../types'
import ChangeEventListener from '../event/listener/ChangeEventListener'
import EventHandler from '../event/handler/EventHandler'
import UnloadEventListener from '../event/listener/UnloadEventListener'
import { debugEventSessionSender, defaultEventSessionSender } from '../event/handler/eventSessionSender'
import KeyUpEventListener from '../event/listener/KeyUpEventListener'

class CollectorWrapper {
  readonly eventHandler: EventHandler

  constructor(options: CollectorOptions, private readonly window: Window) {
    const output = options.debug
      ? debugEventSessionSender(options.maxDelay)
      : defaultEventSessionSender(options.authKey, options.gravityServerUrl)
    this.eventHandler = new EventHandler(uuidv4(), options.requestInterval, output)

    this.initSession()
    this.initializeEventHandlers()
  }

  private initSession() {
    return this.eventHandler.run(createSessionStartedEvent())
  }

  private initializeEventHandlers() {
    new PointerUpEventListener(this.eventHandler, this.window).init()
    new KeyUpEventListener(this.eventHandler, this.window).init()
    new ChangeEventListener(this.eventHandler, this.window).init()
    new UnloadEventListener(this.eventHandler, this.window).init()
  }
}

export default CollectorWrapper
