import { IEventListener } from '../event-listeners/IEventListener'

export default class EventListenersHandler {
  constructor(private readonly eventListeners: IEventListener[]) {}

  initializeEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.init())
  }

  terminateEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.terminate())
  }
}
