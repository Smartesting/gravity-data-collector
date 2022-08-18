import { v4 as uuidv4 } from 'uuid'
import ClickEventListener from '../event-listeners/ClickEventListener'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions } from '../types'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import UserActionHandler from '../user-action/UserActionHandler'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import { debugUserActionSessionSender, defaultUserActionSessionSender } from '../user-action/userActionSessionSender'
import SessionIdHandler from '../session-id-handler/SessionIdHandler'

class CollectorWrapper {
  readonly userActionHandler: UserActionHandler

  constructor(
    private readonly options: CollectorOptions,
    private readonly window: Window,
    private readonly sessionIdHandler: SessionIdHandler,
  ) {
    const output = options.debug
      ? debugUserActionSessionSender(options.maxDelay)
      : defaultUserActionSessionSender(options.authKey, options.gravityServerUrl)
    const isSet = sessionIdHandler.isSet()
    if (!isSet) {
      sessionIdHandler.set(uuidv4())
    }
    this.userActionHandler = new UserActionHandler(sessionIdHandler.get(), options.requestInterval, output)

    if (!isSet) this.initSession()
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
    new BeforeUnloadEventListener(this.userActionHandler, this.window).init()
  }
}

export default CollectorWrapper
