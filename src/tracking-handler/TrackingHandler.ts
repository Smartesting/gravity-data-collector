import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'

export const GRAVITY_SESSION_TRACKING_SUSPENDED = 'gravity-session-tracking-suspended'

export default class TrackingHandler {
  private eventListenerHandler: EventListenersHandler | undefined
  private screenRecorderHandler: ScreenRecorderHandler | undefined
  private trackingActive: boolean = true
  private videoRecordingActive: boolean = true

  constructor(private readonly errorTerminateTracking: number[]) {}

  setTrackingActive(active: boolean) {
    this.trackingActive = active
  }

  setVideoRecordingActive(videoActive: boolean) {
    this.videoRecordingActive = videoActive
  }

  activateTracking(): void {
    if (this.eventListenerHandler === undefined || this.screenRecorderHandler === undefined) {
      throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.')
    }
    window.sessionStorage.removeItem(GRAVITY_SESSION_TRACKING_SUSPENDED)
    this.eventListenerHandler.initializeEventListeners()
    if (this.videoRecordingActive) {
      this.screenRecorderHandler.initializeRecording()
    }
  }

  init(eventListenerHandler: EventListenersHandler, screenRecorderHandler: ScreenRecorderHandler): void {
    this.eventListenerHandler = eventListenerHandler
    this.screenRecorderHandler = screenRecorderHandler
    if (this.isTracking()) {
      this.activateTracking()
    }
  }

  isTracking(): boolean {
    return this.trackingActive && window.sessionStorage.getItem(GRAVITY_SESSION_TRACKING_SUSPENDED) !== '1'
  }

  deactivateTracking(): void {
    if (this.eventListenerHandler === undefined || this.screenRecorderHandler === undefined) {
      throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.')
    }
    window.sessionStorage.setItem(GRAVITY_SESSION_TRACKING_SUSPENDED, '1')
    this.eventListenerHandler.terminateEventListeners()
    if (this.videoRecordingActive) {
      this.screenRecorderHandler.terminateRecording()
    }
  }

  senderErrorCallback(statusCode: number) {
    if (this.errorTerminateTracking.includes(statusCode)) {
      this.deactivateTracking()
    }
  }
}
