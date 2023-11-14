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
import TrackingHandler from '../tracking-handler/TrackingHandler'
import { preventBadSessionTraitValue } from '../session-trait/checkSessionTraitValue'
import { TargetEventListenerOptions } from '../event-listeners/TargetedEventListener'
import createAsyncRequest from '../user-action/createAsyncRequest'
import { trackingUrlStartPart } from '../gravityEndPoints'
import { IEventListener } from '../event-listeners/IEventListener'
import CypressEventListener from '../event-listeners/CypressEventListener'
import { IGravityClient } from '../gravity-client/IGravityClient'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import ConsoleGravityClient from '../gravity-client/ConsoleGravityClient'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import { config } from '../config'
import { RecordingSettingsDispatcher } from '../gravity-client/RecordingSettingsDispatcher'
import crossfetch from 'cross-fetch'
import { RecordingSettings } from '../gravity-client/AbstractGravityClient'

class CollectorWrapper {
  private readonly trackingHandler = new TrackingHandler(config.ERRORS_TERMINATE_TRACKING)
  private readonly recordingSettingsHandler = new RecordingSettingsDispatcher()
  readonly userActionHandler: UserActionHandler
  readonly screenRecorderHandler: ScreenRecorderHandler
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler
  private readonly gravityClient: IGravityClient

  constructor(
    private readonly options: CollectorOptionsWithWindow,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly testNameHandler: TestNameHandler,
    fetch = crossfetch,
  ) {
    this.gravityClient = makeGravityClient(options, this.trackingHandler, this.recordingSettingsHandler, fetch)
    this.userActionHandler = new UserActionHandler(sessionIdHandler, this.gravityClient)
    this.sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, this.gravityClient)
    this.screenRecorderHandler = new ScreenRecorderHandler(sessionIdHandler, this.gravityClient)
    this.eventListenerHandler = new EventListenersHandler(this.makeEventListeners())
    this.recordingSettingsHandler.subscribe(({ enableEventRecording, enableVideoRecording }) => {
      if (!enableEventRecording || !enableVideoRecording) {
        this.terminateRecording(!enableEventRecording, !enableVideoRecording)
      }
    })
  }

  init(): void {
    this.fetchRecordingSettings()
      .then((settings) => this.recordingSettingsHandler.dispatch(settings))
      .catch(console.error)

    const options = this.options
    const currentUrl = options.window.document.URL
    if (!isValidURL(currentUrl)) {
      console.log('[Gravity data collector] invalid URL for tracking: ', currentUrl)
      return
    }
    const isNewSession = !this.sessionIdHandler.isSet() || this.testNameHandler.isNewTest()
    this.testNameHandler.refresh()
    this.trackingHandler.setTrackingActive(!isNewSession || keepSession(options))
    this.trackingHandler.init(this.eventListenerHandler, this.screenRecorderHandler)
    if (this.isListenerEnabled(Listener.Requests)) {
      this.patchFetch()
    }
    if (isNewSession) {
      this.sessionIdHandler.generateNewSessionId()
      this.initSession(createSessionStartedUserAction(options.buildId))
    }
  }

  identifySession(traitName: string, traitValue: SessionTraitValue) {
    if (this.trackingHandler.isTracking() && preventBadSessionTraitValue(traitValue)) {
      void this.sessionTraitHandler.handle(traitName, traitValue)
    }
  }

  terminateRecording(terminateEventRecording: boolean, terminateVideoRecording: boolean) {
    if (terminateEventRecording) {
      this.eventListenerHandler.terminateEventListeners()
      this.screenRecorderHandler.terminateRecording()
      return
    }
    if (terminateVideoRecording) {
      this.screenRecorderHandler.terminateRecording()
    }
  }

  private initSession(sessionStartedUserAction: SessionStartedUserAction) {
    if (this.trackingHandler.isTracking()) void this.userActionHandler.handle(sessionStartedUserAction)
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
        void this.userActionHandler.handle(createAsyncRequest(url, method))
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
        void userActionHandler.handle(createAsyncRequest(url, method))
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
      eventListeners.push(new BeforeUnloadEventListener(this.userActionHandler, window, this.gravityClient.flush))
    }

    const cypress = ((window as any).Cypress as CypressObject) ?? undefined
    if (cypress !== undefined && this.isListenerEnabled(Listener.CypressCommands)) {
      eventListeners.push(new CypressEventListener(cypress, this.userActionHandler, this.gravityClient.flush))
    }
    return eventListeners
  }

  private isListenerEnabled(listener: Listener): boolean {
    const { enabledListeners } = this.options
    return enabledListeners === undefined || enabledListeners.includes(listener)
  }

  private async fetchRecordingSettings(): Promise<RecordingSettings> {
    if (this.options.debug) return this.options
    return await this.gravityClient.readSessionCollectionSettings().then(({ settings }) => {
      const enableEventRecording = settings?.sessionRecording ?? this.options.enableEventRecording
      const enableVideoRecording = settings?.videoRecording ?? this.options.enableVideoRecording
      return { enableEventRecording, enableVideoRecording }
    })
  }
}

export default CollectorWrapper

function keepSession(options: CollectorOptions): boolean {
  if (!options.enableEventRecording) return false
  if (!(options.sessionsPercentageKept >= 100 * Math.random())) return false
  return !options.rejectSession()
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

function makeGravityClient(
  options: CollectorOptionsWithWindow,
  trackingHandler: TrackingHandler,
  recordingSettingsHandler: RecordingSettingsDispatcher,
  fetch = crossfetch,
) {
  return options.debug
    ? new ConsoleGravityClient(options, recordingSettingsHandler)
    : new HttpGravityClient(
        {
          ...options,
          onError: (status) => trackingHandler.senderErrorCallback(status),
        },
        recordingSettingsHandler,
        fetch,
      )
}

function isValidURL(url: string | undefined): boolean {
  return url === undefined || !url.startsWith('about:')
}
