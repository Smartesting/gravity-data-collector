import EventHandler from '../handler/EventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType } from '../../types'

class KeyUpEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.KeyUp, window)
  }

  listener(event: KeyboardEvent) {
    const gravityEvent = createGravityEvent(event, this.eventType)
    if (gravityEvent.target !== undefined) {
      if (event.code.toLowerCase() === 'space') {
        const type = (gravityEvent.target.attributes as Record<string, string>).type
        if (type !== 'radio' && type !== 'checkbox' && type !== 'button') {
          return
        }
      }
      if (event.code.toLowerCase() === 'enter' || event.code.toLowerCase() === 'numpadEnter') {
        const type = (gravityEvent.target.attributes as Record<string, string>).type
        if (type !== 'button') {
          return
        }
      }
      this.eventHandler.run(gravityEvent)
    }
  }
}

export default KeyUpEventListener
