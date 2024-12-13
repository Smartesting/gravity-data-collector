import { IEventListener } from '../event-listeners/IEventListener'
import detectUrlChange from 'detect-url-change'

export default class EventListenersHandler {
  constructor(private readonly eventListeners: IEventListener[], private readonly onUrlChange?: () => void) {}

  initializeEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.init())
    this.onUrlChange && detectUrlChange.on('change', this.onUrlChange)
  }

  terminateEventListeners() {
    this.eventListeners.forEach((eventListener) => eventListener.terminate())
    this.onUrlChange && detectUrlChange.off('change', this.onUrlChange)
  }
}
