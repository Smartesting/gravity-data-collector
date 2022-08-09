import EventHandler from '../handler/EventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType } from '../../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../../utils/listeners'

class KeyDownEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.KeyDown, window)
  }

  listener(event: KeyboardEvent) {
    if (isKeyAllowedByKeyListeners(event.code)) return this.eventHandler.run(createGravityEvent(event, this.eventType))

    if (isTargetAllowedByKeyListeners(event.target)) this.eventHandler.run(createGravityEvent(event, this.eventType))
  }
}

export default KeyDownEventListener
