import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'

export const GRAVITY_SESSION_TRACKING_SUSPENDED = 'gravity-session-tracking-suspended'

export default class TrackingHandler {
  private eventListenerHandler: EventListenersHandler | undefined
  private screenRecorderHandler: ScreenRecorderHandler | undefined
  private active: boolean = true

  constructor(private readonly errorTerminateTracking: number[]) {}

  setActive(active: boolean) {
    this.active = active
  }

  activateTracking(): void {
    if (this.eventListenerHandler === undefined || this.screenRecorderHandler === undefined) {
      throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.')
    }
    window.sessionStorage.removeItem(GRAVITY_SESSION_TRACKING_SUSPENDED)
    this.eventListenerHandler.initializeEventListeners()
    this.screenRecorderHandler.initializeRecording()
  }

  init(eventListenerHandler: EventListenersHandler, screenRecorderHandler: ScreenRecorderHandler): void {
    this.eventListenerHandler = eventListenerHandler
    this.screenRecorderHandler = screenRecorderHandler
    if (this.isTracking()) {
      this.activateTracking()
    }
  }

  isTracking(): boolean {
    return this.active && window.sessionStorage.getItem(GRAVITY_SESSION_TRACKING_SUSPENDED) !== '1'
  }

  deactivateTracking(): void {
    if (this.eventListenerHandler === undefined || this.screenRecorderHandler === undefined) {
      throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.')
    }
    window.sessionStorage.setItem(GRAVITY_SESSION_TRACKING_SUSPENDED, '1')
    this.eventListenerHandler.terminateEventListeners()
    this.screenRecorderHandler.terminateRecording()
  }

  senderErrorCallback(statusCode: number) {
    if (this.errorTerminateTracking.includes(statusCode)) {
      this.deactivateTracking()
    }
  }
}
