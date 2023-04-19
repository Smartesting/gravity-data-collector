import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import MutationObserverHandler from '../mutation-observer-handler/MutationObserverHandler'

export const GRAVITY_SESSION_TRACKING_SUSPENDED = 'gravity-session-tracking-suspended'

export default class TrackingHandler {
  private eventListenerHandler: EventListenersHandler | undefined
  private mutationObserverHandler: MutationObserverHandler | undefined
  private active: boolean = true

  constructor(private readonly errorTerminateTracking: number[]) {}

  setActive(active: boolean) {
    this.active = active
  }

  activateTracking(): void {
    if (this.eventListenerHandler === undefined || this.mutationObserverHandler === undefined) {
      throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.')
    }
    window.sessionStorage.removeItem(GRAVITY_SESSION_TRACKING_SUSPENDED)
    this.eventListenerHandler.initializeEventListeners()
    this.mutationObserverHandler.initializeObserver()
  }

  init(eventListenerHandler: EventListenersHandler, mutationObserverHandler: MutationObserverHandler): void {
    this.eventListenerHandler = eventListenerHandler
    this.mutationObserverHandler = mutationObserverHandler
    if (this.isTracking()) {
      this.activateTracking()
    }
  }

  isTracking(): boolean {
    return this.active && window.sessionStorage.getItem(GRAVITY_SESSION_TRACKING_SUSPENDED) !== '1'
  }

  deactivateTracking(): void {
    if (this.eventListenerHandler === undefined || this.mutationObserverHandler === undefined) {
      throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.')
    }
    window.sessionStorage.setItem(GRAVITY_SESSION_TRACKING_SUSPENDED, '1')
    this.eventListenerHandler.terminateEventListeners()
    this.mutationObserverHandler.terminateObserver()
  }

  private senderErrorCallback(statusCode: number) {
    if (this.errorTerminateTracking.includes(statusCode)) {
      this.deactivateTracking()
    }
  }

  getSenderErrorCallback() {
    return this.senderErrorCallback.bind(this)
  }
}
