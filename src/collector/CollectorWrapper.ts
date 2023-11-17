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
import { RecordingSettingsDispatcher } from '../gravity-client/RecordingSettingsDispatcher'
import crossfetch from 'cross-fetch'
import { RecordingSettings } from '../gravity-client/AbstractGravityClient'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'

class CollectorWrapper {
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
    private readonly timeoutHandler: ITimeoutHandler,
    fetch = crossfetch,
  ) {
    this.gravityClient = options.debug
      ? new ConsoleGravityClient(options, this.recordingSettingsHandler)
      : new HttpGravityClient(options, this.recordingSettingsHandler, fetch)
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

  init(reset = false): void {
    this.fetchRecordingSettings()
      .then((settings) => this.recordingSettingsHandler.dispatch(settings))
      .catch(console.error)

    const options = this.options
    const currentUrl = options.window.document.URL
    if (!isValidURL(currentUrl)) {
      console.log('[Gravity data collector] invalid URL for tracking: ', currentUrl)
      return
    }
    const isNewSession = reset || !this.sessionIdHandler.isSet() || this.testNameHandler.isNewTest()
    console.log('init', { isNewSession })
    if (isNewSession) {
      if (!keepSession(options)) {
        this.recordingSettingsHandler.terminate()
        return
      }

      if (this.testNameHandler.isNewTest()) this.sessionIdHandler.generateNewSessionId()
      this.initSession(createSessionStartedUserAction(options.buildId))
    }
    this.testNameHandler.refresh()
    this.eventListenerHandler.initializeEventListeners()
    this.screenRecorderHandler.initializeRecording()

    if (reset) return
    if (this.isListenerEnabled(Listener.Requests)) this.patchFetch()
    this.userActionHandler.subscribe(this.checkSessionDuration.bind(this))
  }

  async identifySession(traitName: string, traitValue: SessionTraitValue): Promise<void> {
    if (preventBadSessionTraitValue(traitValue)) {
      return await this.sessionTraitHandler.handle(traitName, traitValue)
    }
  }

  terminateRecording(terminateEventRecording: boolean, terminateVideoRecording: boolean) {
    if (terminateEventRecording) {
      this.eventListenerHandler.terminateEventListeners()
      this.screenRecorderHandler.terminateRecording()
      this.userActionHandler.terminate()
      this.sessionTraitHandler.terminate()
      return
    }
    if (terminateVideoRecording) {
      this.screenRecorderHandler.terminateRecording()
    }
  }

  private initSession(sessionStartedUserAction: SessionStartedUserAction) {
    void this.userActionHandler.handle(sessionStartedUserAction)
  }

  private patchFetch() {
    const { gravityServerUrl, originsToRecord, recordRequestsFor, window } = this.options
    const { fetch: originalFetch } = window
    window.fetch = async (...args) => {
      const [resource, config] = args
      const url = resource as string

      if (requestCanBeRecorded(url, gravityServerUrl, recordRequestsFor ?? originsToRecord)) {
        let method = 'unknown'
        if (config?.method != null) {
          method = config.method
        }
        void this.userActionHandler.handle(createAsyncRequest(url, method))
      }

      return await originalFetch(resource, config)
    }

    const userActionHandler = this.userActionHandler
    const originalXHROpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      const method = arguments[0]
      const url = arguments[1]

      if (requestCanBeRecorded(url, gravityServerUrl, recordRequestsFor ?? originsToRecord)) {
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
      eventListeners.push(
        new BeforeUnloadEventListener(this.userActionHandler, window, async () => await this.gravityClient.flush()),
      )
    }

    const cypress = ((window as any).Cypress as CypressObject) ?? undefined
    if (cypress !== undefined && this.isListenerEnabled(Listener.CypressCommands)) {
      eventListeners.push(
        new CypressEventListener(cypress, this.userActionHandler, async () => await this.gravityClient.flush()),
      )
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
      return {
        enableEventRecording,
        enableVideoRecording,
      }
    })
  }

  private async checkSessionDuration() {
    if (this.timeoutHandler.isExpired()) {
      console.log('expired')
      await this.gravityClient.flush()
      console.log('flushed')
      this.terminateRecording(true, true)
      this.sessionIdHandler.generateNewSessionId()
      this.init(true)
    }
  }
}

export default CollectorWrapper

function keepSession(options: CollectorOptions): boolean {
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

function isValidURL(url: string | undefined): boolean {
  return url === undefined || !url.startsWith('about:')
}
