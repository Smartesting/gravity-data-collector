import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions, CypressObject, IEventHandler, SessionStartedUserAction, SessionTraitValue } from '../types'
import UserActionHandler from '../user-action/UserActionHandler'
import { debugSessionUserActionSender, defaultSessionUserActionSender } from '../user-action/sessionUserActionSender'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
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
import { TargetEventListenerOptions } from '../event-listeners/TargetedEventListener'
import { IEventListener } from '../event-listeners-handler/IEventListener'
import { makeCypressListeners } from './makeCypressListeners'
import NopEventHandler from '../event-handlers/NopEventHandler'
import CypressTestEventReporter from '../event-handlers/CypressTestEventReporter'

class CollectorWrapper {
  readonly userActionHandler: UserActionHandler
  readonly userActionsHistory: MemoryUserActionsHistory
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler
  readonly trackingHandler: TrackingHandler

  constructor(
    private readonly options: CollectorOptions,
    private readonly window: Window,
    private readonly sessionIdHandler: ISessionIdHandler,
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
      this.trackingHandler.setActive(keepSession(options))
      sessionIdHandler.generateNewSessionId()
    }
    this.userActionsHistory = new MemoryUserActionsHistory()

    const cypress = ((window as any).Cypress as CypressObject) ?? undefined
    const reporterFilename = options.cypressEventReporterFilename
    if (reporterFilename !== undefined) {
      if (cypress === undefined) console.warn(`No Cypress context to report events in file '${reporterFilename}'`)
    }
    const eventHandler: IEventHandler =
      cypress !== undefined && reporterFilename !== undefined
        ? new CypressTestEventReporter(cypress, reporterFilename, sessionIdHandler)
        : new NopEventHandler()

    this.userActionHandler = new UserActionHandler(
      sessionIdHandler,
      options.requestInterval,
      userActionOutput,
      options.onPublish,
      this.userActionsHistory,
      eventHandler,
    )
    this.sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, options.requestInterval, sessionTraitOutput)

    if (isNewSession) this.initSession(createSessionStartedUserAction())

    const targetedEventListenerOptions: TargetEventListenerOptions = {
      excludeRegex: options.excludeRegex,
      customSelector: options.customSelector,
    }

    const gravityListeners: IEventListener[] = [
      new ClickEventListener(this.userActionHandler, this.window, targetedEventListenerOptions),
      new KeyUpEventListener(this.userActionHandler, this.window, targetedEventListenerOptions),
      new KeyDownEventListener(
        this.userActionHandler,
        this.window,
        this.userActionsHistory,
        targetedEventListenerOptions,
      ),
      new ChangeEventListener(this.userActionHandler, this.window, targetedEventListenerOptions),
      new BeforeUnloadEventListener(this.userActionHandler, this.window),
    ]
    this.eventListenerHandler = new EventListenersHandler(
      gravityListeners.concat(makeCypressListeners(cypress, this.sessionIdHandler, eventHandler)),
    )

    this.trackingHandler.init(this.eventListenerHandler)
  }

  identifySession(traitName: string, traitValue: SessionTraitValue) {
    if (this.trackingHandler.isTracking() && preventBadSessionTraitValue(traitValue)) {
      this.sessionTraitHandler.handle(traitName, traitValue)
    }
  }

  private initSession(sessionStartedUserAction: SessionStartedUserAction) {
    if (this.trackingHandler.isTracking()) this.userActionHandler.handle(sessionStartedUserAction)
  }
}

export default CollectorWrapper

function keepSession(options: CollectorOptions): boolean {
  const keepSession = options.sessionsPercentageKept >= 100 * Math.random()
  const rejectSession = options.rejectSession()
  return keepSession && !rejectSession
}
