import EventHandler from '../handler/EventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType } from '../../types'

class KeyUpEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.KeyUp, window)
  }

  listener(event: KeyboardEvent) {
    this.eventHandler.run(createGravityEvent(event, this.eventType))
  }
}

export default KeyUpEventListener
