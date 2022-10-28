import { v4 as uuidv4 } from 'uuid'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions, SessionStartedUserAction, SessionTraitValue } from '../types'
import UserActionHandler from '../user-action/UserActionHandler'
import { debugSessionUserActionSender, defaultSessionUserActionSender } from '../user-action/sessionUserActionSender'
import SessionIdHandler from '../session-id-handler/SessionIdHandler'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import TestNameHandler from '../test-name-handler/TestNameHandler'
import SessionTraitHandler from '../session-trait/SessionTraitHandler'
import { debugSessionTraitSender, defaultSessionTraitSender } from '../session-trait/sessionTraitSender'
import { nop } from '../utils/nop'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ClickEventListener from '../event-listeners/ClickEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import { config } from '../config'
import TrackingHandler from '../tracking-handler/TrackingHandler'
import { preventBadSessionTraitValue } from '../session-trait/checkSessionTraitValue'

class CollectorWrapper {
  readonly userActionHandler: UserActionHandler
  readonly userActionsHistory: MemoryUserActionsHistory
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler
  readonly trackingHandler: TrackingHandler

  constructor(
    private readonly options: CollectorOptions,
    private readonly window: Window,
    private readonly sessionIdHandler: SessionIdHandler,
    private readonly testNameHandler: TestNameHandler,
  ) {
    this.trackingHandler = new TrackingHandler(config.ERRORS_TERMINATE_TRACKING)

    const userActionOutput = options.debug
      ? debugSessionUserActionSender(options.maxDelay)
      : defaultSessionUserActionSender(
          options.authKey,
          options.gravityServerUrl,
          nop,
          this.trackingHandler.getSenderErrorCallback(),
        )

    const sessionTraitOutput = options.debug
      ? debugSessionTraitSender(options.maxDelay)
      : defaultSessionTraitSender(
          options.authKey,
          options.gravityServerUrl,
          nop,
          this.trackingHandler.getSenderErrorCallback(),
        )

    const isNewSession = !sessionIdHandler.isSet() || testNameHandler.isNewTest()
    testNameHandler.refresh()

    if (isNewSession) {
      sessionIdHandler.set(uuidv4())
    }
    this.userActionsHistory = new MemoryUserActionsHistory()

    this.userActionHandler = new UserActionHandler(
      sessionIdHandler.get(),
      options.requestInterval,
      userActionOutput,
      options.onPublish,
      this.userActionsHistory,
    )
    this.sessionTraitHandler = new SessionTraitHandler(
      sessionIdHandler.get(),
      options.requestInterval,
      sessionTraitOutput,
    )

    if (isNewSession) this.initSession(createSessionStartedUserAction())

    this.eventListenerHandler = new EventListenersHandler([
      new ClickEventListener(this.userActionHandler, this.window),
      new KeyUpEventListener(this.userActionHandler, this.window),
      new KeyDownEventListener(this.userActionHandler, this.window, this.userActionsHistory),
      new ChangeEventListener(this.userActionHandler, this.window),
      new BeforeUnloadEventListener(this.userActionHandler, this.window),
    ])

    this.trackingHandler.init(this.eventListenerHandler)
  }

  identifySession(traitName: string, traitValue: SessionTraitValue) {
    if (this.trackingHandler.isTracking() && preventBadSessionTraitValue(traitValue)) {
      this.sessionTraitHandler.handle(traitName, traitValue)
    }
  }

  private initSession(sessionStartedUserAction: SessionStartedUserAction) {
    return this.userActionHandler.handle(sessionStartedUserAction)
  }
}

export default CollectorWrapper
