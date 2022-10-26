import EventListener from '../event-listeners/EventListener'

export default class EventListenersHandler {
  constructor(private readonly eventListeners: EventListener[]) {}

  initializeEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.init())
  }

  terminateEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.terminate())
  }
}
