import EventHandler from '../handler/EventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType } from '../../types'

class ClickEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.Click, window)
  }

  listener(event: MouseEvent) {
    const pointerEvent = event as PointerEvent
    if (pointerEvent.pointerType !== undefined && pointerEvent.pointerType !== '') {
      this.eventHandler.run(createGravityEvent(event, this.eventType))
    }
  }
}

export default ClickEventListener
