import EventListener from '../event-listeners/EventListener'
import { config } from '../config'

export default class EventListenersHandler {
  constructor(
    private readonly errorTerminateTracking: number[],
    private readonly eventListeners: EventListener[] = [],
  ) {}

  pushEventListeners(...eventListeners: EventListener[]) {
    eventListeners.forEach((eventListener) => this.eventListeners.push(eventListener))
  }

  initializeEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.init())
  }

  terminateEventListeners() {
    console.log('terminateEventListeners')
    this.eventListeners.forEach((eventListener) => eventListener.terminate())
  }

  private senderErrorCallback(error: number) {
    if (config.ERRORS_TERMINATE_TRACKING.includes(error)) {
      this.terminateEventListeners()
    }
  }

  getSenderErrorCallback() {
    return this.senderErrorCallback.bind(this)
  }
}
