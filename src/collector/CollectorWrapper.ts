import { v4 as uuidv4 } from 'uuid'
import ClickEventListener from '../event-listeners/ClickEventListener'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions } from '../types'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import UserActionHandler from '../user-action/UserActionHandler'
import UnloadEventListener from '../event-listeners/UnloadEventListener'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import { debugUserActionSessionSender, defaultUserActionSessionSender } from '../user-action/userActionSessionSender'

class CollectorWrapper {
  readonly userActionHandler: UserActionHandler

  constructor(options: CollectorOptions, private readonly window: Window) {
    const output = options.debug
      ? debugUserActionSessionSender(options.maxDelay)
      : defaultUserActionSessionSender(options.authKey, options.gravityServerUrl)
    this.userActionHandler = new UserActionHandler(uuidv4(), options.requestInterval, output)

    this.initSession()
    this.initializeEventListeners()
  }

  private initSession() {
    return this.userActionHandler.handle(createSessionStartedUserAction())
  }

  private initializeEventListeners() {
    new ClickEventListener(this.userActionHandler, this.window).init()
    new KeyUpEventListener(this.userActionHandler, this.window).init()
    new KeyDownEventListener(this.userActionHandler, this.window).init()
    new ChangeEventListener(this.userActionHandler, this.window).init()
    new UnloadEventListener(this.userActionHandler, this.window).init()
  }
}

export default CollectorWrapper
