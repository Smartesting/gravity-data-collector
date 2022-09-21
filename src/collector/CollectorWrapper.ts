import { v4 as uuidv4 } from 'uuid'
import ClickEventListener from '../event-listeners/ClickEventListener'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions, SessionStartedUserAction } from '../types'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import UserActionHandler from '../user-action/UserActionHandler'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import { debugUserActionSessionSender, defaultUserActionSessionSender } from '../user-action/userActionSessionSender'
import SessionIdHandler from '../session-id-handler/SessionIdHandler'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import TestNameHandler from '../test-name-handler/TestNameHandler'

class CollectorWrapper {
  readonly userActionHandler: UserActionHandler
  readonly userActionsHistory: MemoryUserActionsHistory

  constructor(
    private readonly options: CollectorOptions,
    private readonly window: Window,
    private readonly sessionIdHandler: SessionIdHandler,
    private readonly testNameHandler: TestNameHandler,
  ) {
    const output = options.debug
      ? debugUserActionSessionSender(options.maxDelay)
      : defaultUserActionSessionSender(options.authKey, options.gravityServerUrl)

    const isNewSession = !sessionIdHandler.isSet() || testNameHandler.isNewTest()
    testNameHandler.refresh()

    if (isNewSession) {
      sessionIdHandler.set(uuidv4())
    }
    this.userActionsHistory = new MemoryUserActionsHistory()

    this.userActionHandler = new UserActionHandler(
      sessionIdHandler.get(),
      options.requestInterval,
      output,
      this.userActionsHistory,
    )

    if (isNewSession) this.initSession(createSessionStartedUserAction())
    this.initializeEventListeners()
  }

  private initSession(sessionStartedUserAction: SessionStartedUserAction) {
    return this.userActionHandler.handle(sessionStartedUserAction)
  }

  private initializeEventListeners() {
    new ClickEventListener(this.userActionHandler, this.window).init()
    new KeyUpEventListener(this.userActionHandler, this.window).init()
    new KeyDownEventListener(this.userActionHandler, this.window, this.userActionsHistory).init()
    new ChangeEventListener(this.userActionHandler, this.window).init()
    new BeforeUnloadEventListener(this.userActionHandler, this.window).init()
  }
}

export default CollectorWrapper
