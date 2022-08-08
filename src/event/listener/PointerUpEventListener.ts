import EventHandler from '../handler/EventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType } from '../../types'

class PointerUpEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.PointerUp, window)
  }

  listener(event: MouseEvent) {
    this.eventHandler.run(createGravityEvent(event, this.eventType))
  }
}

export default PointerUpEventListener
