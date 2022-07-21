import EventHandler from '../handler/EventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType } from '../../types'

class ClickEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.Click, window)
  }

  async listener(event: MouseEvent) {
    this.eventHandler.run(await createGravityEvent(event, this.eventType))
  }
}

export default ClickEventListener
