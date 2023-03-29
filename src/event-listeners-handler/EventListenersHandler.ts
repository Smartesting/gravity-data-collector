import { IEventListener } from './IEventListener'

export default class EventListenersHandler {
  constructor(private readonly eventListeners: readonly IEventListener[]) {}

  initializeEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.init())
  }

  terminateEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.terminate())
  }
}
