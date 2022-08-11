import { v4 as uuidv4 } from 'uuid'
import ClickEventListener from '../event/listener/ClickEventListener'
import { createSessionStartedUserAction } from '../action/createSessionStartedUserAction'
import { CollectorOptions } from '../types'
import ChangeEventListener from '../event/listener/ChangeEventListener'
import EventHandler from '../event/handler/EventHandler'
import UnloadEventListener from '../event/listener/UnloadEventListener'
import KeyUpEventListener from '../event/listener/KeyUpEventListener'
import KeyDownEventListener from '../event/listener/KeyDownEventListener'
import { debugUserActionSessionSender, defaultUserActionSessionSender } from '../event/handler/userActionSessionSender'

class CollectorWrapper {
  readonly eventHandler: EventHandler

  constructor(options: CollectorOptions, private readonly window: Window) {
    const output = options.debug
      ? debugUserActionSessionSender(options.maxDelay)
      : defaultUserActionSessionSender(options.authKey, options.gravityServerUrl)
    this.eventHandler = new EventHandler(uuidv4(), options.requestInterval, output)

    this.initSession()
    this.initializeEventHandlers()
  }

  private initSession() {
    return this.eventHandler.run(createSessionStartedUserAction())
  }

  private initializeEventHandlers() {
    new ClickEventListener(this.eventHandler, this.window).init()
    new KeyUpEventListener(this.eventHandler, this.window).init()
    new KeyDownEventListener(this.eventHandler, this.window).init()
    new ChangeEventListener(this.eventHandler, this.window).init()
    new UnloadEventListener(this.eventHandler, this.window).init()
  }
}

export default CollectorWrapper
