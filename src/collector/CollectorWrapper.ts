import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import {
  CollectorOptions,
  CollectorOptionsWithWindow,
  CypressObject,
  Listener,
  SessionStartedUserAction,
  SessionTraitValue,
} from '../types'

import UserActionHandler from '../user-action/UserActionHandler'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import TestNameHandler from '../test-name-handler/TestNameHandler'
import SessionTraitHandler from '../session-trait/SessionTraitHandler'
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
import { IEventListener } from '../event-listeners/IEventListener'
import CypressEventListener from '../event-listeners/CypressEventListener'
import { IGravityClient } from '../gravity-client/IGravityClient'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import crossfetch from 'cross-fetch'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'

class CollectorWrapper {
  readonly userActionHandler: UserActionHandler
  readonly screenRecorderHandler: ScreenRecorderHandler
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler
  readonly trackingHandler: TrackingHandler
  readonly gravityClient: IGravityClient

  constructor(
    readonly options: CollectorOptionsWithWindow,
    readonly sessionIdHandler: ISessionIdHandler,
    readonly testNameHandler: TestNameHandler,
    fetch = crossfetch,
  ) {
    this.trackingHandler = new TrackingHandler(config.ERRORS_TERMINATE_TRACKING)

    this.gravityClient = options.debug
      ? new ConsoleGravityClient(options.requestInterval, options.maxDelay)
      : new HttpGravityClient(
          options.requestInterval,
          {
            ...options,
            onError: (status) => this.trackingHandler.senderErrorCallback(status),
          },
          fetch,
        )

    const isNewSession =
      trackingIsAllowed(options.window.document.URL) && (!sessionIdHandler.isSet() || testNameHandler.isNewTest())
    testNameHandler.refresh()

    if (isNewSession) {
      this.trackingHandler.setActive(keepSession(options))
      sessionIdHandler.generateNewSessionId()
    }

    this.userActionHandler = new UserActionHandler(sessionIdHandler, this.gravityClient)
    this.sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, this.gravityClient)
    this.screenRecorderHandler = new ScreenRecorderHandler(sessionIdHandler, this.gravityClient)

    if (isNewSession) this.initSession(createSessionStartedUserAction())

    const eventListeners = this.makeEventListeners()
    this.eventListenerHandler = new EventListenersHandler(eventListeners)
    this.trackingHandler.init(this.eventListenerHandler, this.screenRecorderHandler)

    if (this.isListenerEnabled(Listener.Requests)) {
      this.patchFetch()
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

  private patchFetch() {
    const { fetch: originalFetch } = this.options.window
    this.options.window.fetch = async (...args) => {
      const [resource, config] = args
      const url = resource as string

      if (
        this.trackingHandler.isTracking() &&
        requestCanBeRecorded(
          url,
          this.options.gravityServerUrl,
          this.options.recordRequestsFor ?? this.options.originsToRecord,
        )
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
        requestCanBeRecorded(
          url,
          collectorWrapper.options.gravityServerUrl,
          collectorWrapper.options.recordRequestsFor ?? collectorWrapper.options.originsToRecord,
        )
      ) {
        collectorWrapper.userActionHandler.handle(createAsyncRequest(url, method))
      }

      return originalXHROpen.apply(this, Array.prototype.slice.call(arguments) as any)
    }
  }

  private makeEventListeners() {
    const targetedEventListenerOptions: TargetEventListenerOptions = {
      excludeRegex: this.options.excludeRegex,
      customSelector: this.options.customSelector,
      selectorsOptions: this.options.selectorsOptions,
    }

    const eventListeners: IEventListener[] = []

    if (this.isListenerEnabled(Listener.Click)) {
      eventListeners.push(
        new ClickEventListener(this.userActionHandler, this.options.window, targetedEventListenerOptions),
      )
    }

    if (this.isListenerEnabled(Listener.KeyUp)) {
      eventListeners.push(
        new KeyUpEventListener(this.userActionHandler, this.options.window, targetedEventListenerOptions),
      )
    }

    if (this.isListenerEnabled(Listener.KeyDown)) {
      eventListeners.push(
        new KeyDownEventListener(this.userActionHandler, this.options.window, targetedEventListenerOptions),
      )
    }

    if (this.isListenerEnabled(Listener.Change)) {
      eventListeners.push(
        new ChangeEventListener(this.userActionHandler, this.options.window, targetedEventListenerOptions),
      )
    }

    if (this.isListenerEnabled(Listener.BeforeUnload)) {
      eventListeners.push(new BeforeUnloadEventListener(this.userActionHandler, this.options.window))
    }

    const cypress = ((window as any).Cypress as CypressObject) ?? undefined

    if (cypress !== undefined && this.isListenerEnabled(Listener.CypressCommands)) {
      eventListeners.push(new CypressEventListener(cypress, this.userActionHandler))
    }
    return eventListeners
  }

  private isListenerEnabled(listener: Listener): boolean {
    const { enabledListeners } = this.options
    return enabledListeners === undefined || enabledListeners.includes(listener)
  }
}

export default CollectorWrapper

function trackingIsAllowed(url: string | undefined): boolean {
  return url === undefined || !url.startsWith('about:')
}

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
