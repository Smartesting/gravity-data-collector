import EventHandler from '../handler/EventHandler'
import EventListener from './EventListener'
import { EventType, GravitySessionEndedEvent } from '../../types'
import viewport from '../../utils/viewport'
import location from '../../utils/location'

class UnloadEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.Unload, window)
  }

  async listener(event: Event) {
    const sessionEndedEvent: GravitySessionEndedEvent = {
      viewportData: viewport(),
      location: location(),
      type: this.eventType,
    }
    this.eventHandler.run(sessionEndedEvent)
  }
}

export default UnloadEventListener
