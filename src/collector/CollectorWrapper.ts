import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions, CypressObject, SessionStartedUserAction, SessionTraitValue } from '../types'
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
import createAsyncRequest from '../user-action/createAsyncRequest'
import { trackingUrlStartPart } from '../gravityEndPoints'
import CypressEventListener from '../event-listeners/CypressEventListener'
import { IEventListener } from '../event-listeners/IEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'

class CollectorWrapper {
  readonly userActionHandler: IUserActionHandler
  readonly userActionsHistory: MemoryUserActionsHistory
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler
  readonly trackingHandler: TrackingHandler

  constructor(
    readonly options: CollectorOptions,
    private readonly window: Window,
    readonly sessionIdHandler: ISessionIdHandler,
    readonly testNameHandler: TestNameHandler,
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

    this.userActionHandler = new UserActionHandler(
      sessionIdHandler,
      options.requestInterval,
      userActionOutput,
      options.onPublish,
      this.userActionsHistory,
    )
    this.sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, options.requestInterval, sessionTraitOutput)

    if (isNewSession) this.initSession(createSessionStartedUserAction())

    const targetedEventListenerOptions: TargetEventListenerOptions = {
      excludeRegex: options.excludeRegex,
      customSelector: options.customSelector,
      selectorsOptions: options.selectorsOptions,
    }

    const eventListeners: IEventListener[] = [
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
    const cypress = ((window as any).Cypress as CypressObject) ?? undefined
    if (cypress !== undefined) {
      eventListeners.push(new CypressEventListener(cypress, this.userActionHandler))
    }

    this.eventListenerHandler = new EventListenersHandler(eventListeners)

    this.trackingHandler.init(this.eventListenerHandler)

    const { fetch: originalFetch } = window
    window.fetch = async (...args) => {
      const [resource, config] = args
      const url = resource as string

      if (
        this.trackingHandler.isTracking() &&
        requestCanBeRecorded(url, options.gravityServerUrl, options.recordRequestsFor ?? options.originsToRecord)
      ) {
        let method = 'unknown'
        if (config?.method != null) {
          method = config.method
        }
        this.userActionHandler.handle(createAsyncRequest(url, method))
      }

      return await originalFetch(resource, config)
    }

    const collectorWrapper = this
    const originalXHROpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      const method = arguments[0]
      const url = arguments[1]

      if (
        collectorWrapper.trackingHandler.isTracking() &&
        requestCanBeRecorded(url, options.gravityServerUrl, options.recordRequestsFor ?? options.originsToRecord)
      ) {
        collectorWrapper.userActionHandler.handle(createAsyncRequest(url, method))
      }

      return originalXHROpen.apply(this, Array.prototype.slice.call(arguments) as any)
    }
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

function requestCanBeRecorded(url: string, gravityServerUrl: string, recordRequestsFor?: string[]) {
  if (recordRequestsFor === undefined) {
    return false
  }

  if (url.startsWith(trackingUrlStartPart(gravityServerUrl))) {
    return false
  }

  for (const urlOrigin of recordRequestsFor) {
    if (url.startsWith(urlOrigin)) {
      return true
    }
  }

  return false
}
