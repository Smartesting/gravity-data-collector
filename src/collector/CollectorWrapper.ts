import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import {
  CollectorOptions,
  CollectorOptionsWithWindow,
  CypressObject,
  Listener,
  SessionCollectionSettings,
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
import TrackingHandler from '../tracking-handler/TrackingHandler'
import { preventBadSessionTraitValue } from '../session-trait/checkSessionTraitValue'
import { TargetEventListenerOptions } from '../event-listeners/TargetedEventListener'
import createAsyncRequest from '../user-action/createAsyncRequest'
import { trackingUrlStartPart } from '../gravityEndPoints'
import { IEventListener } from '../event-listeners/IEventListener'
import CypressEventListener from '../event-listeners/CypressEventListener'
import { IGravityClient } from '../gravity-client/IGravityClient'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'

// FIXME: reduce the constructor to his minimum!
class CollectorWrapper {
  readonly userActionHandler: UserActionHandler
  readonly screenRecorderHandler: ScreenRecorderHandler
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler

  constructor(
    private readonly options: CollectorOptionsWithWindow,
    private readonly trackingHandler: TrackingHandler,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly gravityClient: IGravityClient,
    private readonly testNameHandler: TestNameHandler,
  ) {
    this.userActionHandler = new UserActionHandler(sessionIdHandler, this.gravityClient)
    this.sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, this.gravityClient)
    this.screenRecorderHandler = new ScreenRecorderHandler(sessionIdHandler, this.gravityClient)
    this.eventListenerHandler = new EventListenersHandler(this.makeEventListeners())
  }

  init(settings: SessionCollectionSettings) {
    const isNewSession = !this.sessionIdHandler.isSet() || this.testNameHandler.isNewTest()
    this.testNameHandler.refresh()
    this.trackingHandler.setTrackingActive(!isNewSession || (keepSession(this.options) && settings.sessionRecording))
    this.trackingHandler.setVideoRecordingActive(settings.videoRecording)
    this.trackingHandler.init(this.eventListenerHandler, this.screenRecorderHandler)
    if (isNewSession) {
      this.sessionIdHandler.generateNewSessionId()
      this.initSession(createSessionStartedUserAction(this.options.buildId))
    }
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
    const { gravityServerUrl, originsToRecord, recordRequestsFor, window } = this.options
    const { fetch: originalFetch } = window
    window.fetch = async (...args) => {
      const [resource, config] = args
      const url = resource as string

      if (
        this.trackingHandler.isTracking() &&
        requestCanBeRecorded(url, gravityServerUrl, recordRequestsFor ?? originsToRecord)
      ) {
        let method = 'unknown'
        if (config?.method != null) {
          method = config.method
        }
        this.userActionHandler.handle(createAsyncRequest(url, method))
      }

      return await originalFetch(resource, config)
    }

    const { trackingHandler, userActionHandler } = this
    const originalXHROpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      const method = arguments[0]
      const url = arguments[1]

      if (
        trackingHandler.isTracking() &&
        requestCanBeRecorded(url, gravityServerUrl, recordRequestsFor ?? originsToRecord)
      ) {
        userActionHandler.handle(createAsyncRequest(url, method))
      }

      return originalXHROpen.apply(this, Array.prototype.slice.call(arguments) as any)
    }
  }

  private makeEventListeners() {
    const { window, excludeRegex, customSelector, selectorsOptions } = this.options
    const targetedEventListenerOptions: TargetEventListenerOptions = {
      excludeRegex,
      customSelector,
      selectorsOptions,
    }

    const eventListeners: IEventListener[] = []
    if (this.isListenerEnabled(Listener.Click)) {
      eventListeners.push(new ClickEventListener(this.userActionHandler, window, targetedEventListenerOptions))
    }
    if (this.isListenerEnabled(Listener.KeyUp)) {
      eventListeners.push(new KeyUpEventListener(this.userActionHandler, window, targetedEventListenerOptions))
    }
    if (this.isListenerEnabled(Listener.KeyDown)) {
      eventListeners.push(new KeyDownEventListener(this.userActionHandler, window, targetedEventListenerOptions))
    }
    if (this.isListenerEnabled(Listener.Change)) {
      eventListeners.push(new ChangeEventListener(this.userActionHandler, window, targetedEventListenerOptions))
    }
    if (this.isListenerEnabled(Listener.BeforeUnload)) {
      eventListeners.push(new BeforeUnloadEventListener(this.userActionHandler, window))
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
