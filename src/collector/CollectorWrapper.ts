import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import {
  CollectorOptions,
  CypressObject,
  Listener,
  NO_RECORDING_SETTINGS,
  RecordingSettings,
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
import crossfetch from 'cross-fetch'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import ContextMenuEventListener from '../event-listeners/ContextMenuEventListener'
import CopyEventListener from '../event-listeners/CopyEventListener'
import CutEventListener from '../event-listeners/CutEventListener'
import DblClickEventListener from '../event-listeners/DblClickEventListener'
import DragStartEventListener from '../event-listeners/DragStartEventListener'
import DropEventListener from '../event-listeners/DropEventListener'
import PlayEventListener from '../event-listeners/PlayEventListener'
import PauseEventListener from '../event-listeners/PauseEventListener'
import SeekedEventListener from '../event-listeners/SeekedEventListener'
import PasteEventListener from '../event-listeners/PasteEventListener'
import FullScreenChangeEventListener from '../event-listeners/FullScreenChangeEventListener'
import HashChangeEventListener from '../event-listeners/HashChangeEventListener'
import FocusEventListener from '../event-listeners/FocusEventListener'
import BlurEventListener from '../event-listeners/BlurEventListener'
import SubmitEventListener from '../event-listeners/SubmitEventListener'
import ResetEventListener from '../event-listeners/ResetEventListener'
import ScrollEventListener from '../event-listeners/ScrollEventListener'
import ResizeEventListener from '../event-listeners/ResizeEventListener'
import SelectEventListener from '../event-listeners/SelectEventListener'
import ToggleEventListener from '../event-listeners/ToggleEventListener'
import { retrieveUrl } from '../utils/request'
import TouchStartEventListener from '../event-listeners/TouchStartEventListener'
import TouchEndEventListener from '../event-listeners/TouchEndEventListener'
import TouchMoveEventListener from '../event-listeners/TouchMoveEventListener'
import TouchCancelEventListener from '../event-listeners/TouchCancelEventListener'
import RecordingSettingsDispatcher from '../gravity-client/RecordingSettingsDispatcher'
import SnapshotRecorderHandler from '../snapshot-recorder/SnapshotRecorderHandler'

class CollectorWrapper {
  private readonly recordingSettingsHandler = new RecordingSettingsDispatcher()
  readonly userActionHandler: UserActionHandler
  readonly screenRecorderHandler: ScreenRecorderHandler
  readonly snapshotRecorderHandler: SnapshotRecorderHandler
  readonly sessionTraitHandler: SessionTraitHandler
  readonly eventListenerHandler: EventListenersHandler
  private readonly gravityClient: IGravityClient

  constructor(
    private readonly options: CollectorOptions,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly testNameHandler: TestNameHandler,
    private readonly timeoutHandler: ITimeoutHandler,
    fetch = crossfetch,
  ) {
    this.gravityClient = options.debug
      ? new ConsoleGravityClient(options, this.recordingSettingsHandler)
      : new HttpGravityClient(options, this.recordingSettingsHandler, fetch)
    this.snapshotRecorderHandler = new SnapshotRecorderHandler(
      options.window,
      timeoutHandler,
      sessionIdHandler,
      this.gravityClient,
    )
    this.userActionHandler = new UserActionHandler(
      sessionIdHandler,
      timeoutHandler,
      this.snapshotRecorderHandler,
      this.gravityClient,
      this.options.useHashInUrlAsPathname,
    )
    this.sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, this.gravityClient)
    this.screenRecorderHandler = new ScreenRecorderHandler(sessionIdHandler, timeoutHandler, this.gravityClient)
    this.eventListenerHandler = new EventListenersHandler(this.makeEventListeners())
    this.recordingSettingsHandler.subscribe(
      ({
        enableEventRecording,
        enableVideoRecording,
        enableVideoAnonymization,
        ignoreSelectors,
        anonymizeSelectors,
      }) => {
        if (!enableEventRecording || !enableVideoRecording) {
          this.terminateRecording(!enableEventRecording, !enableVideoRecording)
        }
        this.userActionHandler.setAnonymizationSettings({
          anonymizeSelectors,
          ignoreSelectors,
        })
        if (enableVideoRecording) {
          this.screenRecorderHandler.initializeRecording({
            enableAnonymization: enableVideoAnonymization,
            ignoreSelectors,
            anonymizeSelectors,
          })
          this.snapshotRecorderHandler.initializeRecording({
            enableAnonymization: enableVideoAnonymization,
            ignoreSelectors,
            anonymizeSelectors,
          })
        }
      },
    )
  }

  init(reset = false): void {
    this.fetchRecordingSettings()
      .then((settings) => this.recordingSettingsHandler.dispatch(settings))
      .catch(() => {
        this.recordingSettingsHandler.dispatch(NO_RECORDING_SETTINGS)
      })

    if (!reset) {
      if (this.isListenerEnabled(Listener.Requests)) this.patchFetch()
      this.userActionHandler.subscribe(this.checkTimeout.bind(this))
    }

    const options = this.options
    const currentUrl = options.window.document.URL
    if (!isValidURL(currentUrl)) {
      console.log('[Gravity data collector] invalid URL for tracking: ', currentUrl)
      return
    }
    const isNewSession =
      reset || !this.sessionIdHandler.isSet() || this.testNameHandler.isNewTest() || this.timeoutHandler.isExpired()

    if (isNewSession) {
      if (!keepSession(options)) {
        this.recordingSettingsHandler.terminate()
        return
      }
      if (reset) {
        this.userActionHandler.activate()
        this.sessionTraitHandler.activate()
      }
      if (this.testNameHandler.isNewTest()) this.sessionIdHandler.generateNewSessionId()
      this.initSession(createSessionStartedUserAction(options.buildId))
    }
    this.testNameHandler.refresh()
    this.eventListenerHandler.initializeEventListeners()
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
      this.snapshotRecorderHandler.terminateRecording()
      this.userActionHandler.terminate()
      this.sessionTraitHandler.terminate()
      this.gravityClient.reset()
      return
    }
    if (terminateVideoRecording) {
      this.screenRecorderHandler.terminateRecording()
      this.snapshotRecorderHandler.terminateRecording()
    }
  }

  private initSession(sessionStartedUserAction: SessionStartedUserAction) {
    void this.userActionHandler.handle(sessionStartedUserAction)
  }

  private patchFetch() {
    const { gravityServerUrl, recordRequestsFor, window } = this.options
    const originalFetch = window.fetch
    window.fetch = async (input: any /* should be RequestInfo|URL, but TSC failed */, init?: RequestInit) => {
      const url = retrieveUrl(input)

      if (requestCanBeRecorded(url, gravityServerUrl, recordRequestsFor)) {
        let method = 'unknown'
        if (init?.method != null) {
          method = init.method
        }
        void this.userActionHandler.handle(createAsyncRequest(url, method))
      }

      return await originalFetch(input, init)
    }
    const userActionHandler = this.userActionHandler
    const originalXHROpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      const method = arguments[0]
      const url = arguments[1]

      if (requestCanBeRecorded(url, gravityServerUrl, recordRequestsFor)) {
        void userActionHandler.handle(createAsyncRequest(url, method))
      }

      return originalXHROpen.apply(this, Array.prototype.slice.call(arguments) as any)
    }
  }

  private makeEventListeners() {
    const { window, selectorsOptions } = this.options
    const targetedEventListenerOptions: TargetEventListenerOptions = {
      selectorsOptions,
    }

    const eventListeners: IEventListener[] = []
    const eventListenersClassByListener = {
      [Listener.Click]: ClickEventListener,
      [Listener.DblClick]: DblClickEventListener,
      [Listener.ContextMenu]: ContextMenuEventListener,
      [Listener.Change]: ChangeEventListener,
      [Listener.KeyUp]: KeyUpEventListener,
      [Listener.KeyDown]: KeyDownEventListener,
      [Listener.Copy]: CopyEventListener,
      [Listener.Cut]: CutEventListener,
      [Listener.Paste]: PasteEventListener,
      [Listener.Select]: SelectEventListener,
      [Listener.DragStart]: DragStartEventListener,
      [Listener.Drop]: DropEventListener,
      [Listener.Play]: PlayEventListener,
      [Listener.Pause]: PauseEventListener,
      [Listener.Seeked]: SeekedEventListener,
      [Listener.FullScreenChange]: FullScreenChangeEventListener,
      [Listener.Resize]: ResizeEventListener,
      [Listener.HashChange]: HashChangeEventListener,
      [Listener.Focus]: FocusEventListener,
      [Listener.Blur]: BlurEventListener,
      [Listener.Submit]: SubmitEventListener,
      [Listener.Reset]: ResetEventListener,
      [Listener.Scroll]: ScrollEventListener,
      [Listener.Toggle]: ToggleEventListener,
      [Listener.TouchStart]: TouchStartEventListener,
      [Listener.TouchMove]: TouchMoveEventListener,
      [Listener.TouchEnd]: TouchEndEventListener,
      [Listener.TouchCancel]: TouchCancelEventListener,
    }

    for (const [listener, ListenerClass] of Object.entries(eventListenersClassByListener)) {
      if (this.isListenerEnabled(listener as Listener)) {
        eventListeners.push(new ListenerClass(this.userActionHandler, window, targetedEventListenerOptions))
      }
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
    if (this.options.debug) {
      return this.options
    }

    return await this.gravityClient.readSessionCollectionSettings().then(({ settings, error }) => {
      if (settings === null || error !== null) return NO_RECORDING_SETTINGS
      return {
        enableEventRecording: settings.sessionRecording,
        enableVideoRecording: settings.videoRecording,
        enableVideoAnonymization: settings.videoAnonymization,
        anonymizeSelectors: settings.anonymizeSelectors,
        ignoreSelectors: settings.ignoreSelectors,
      }
    })
  }

  private async checkTimeout() {
    if (this.timeoutHandler.isExpired()) {
      this.timeoutHandler.reset()
      this.sessionIdHandler.generateNewSessionId()
      await this.gravityClient.flush()
      this.terminateRecording(true, true)
      this.init(true)
    } else {
      this.timeoutHandler.reset()
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
