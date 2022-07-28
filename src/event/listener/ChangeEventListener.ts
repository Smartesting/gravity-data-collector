import EventHandler from '../handler/EventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType, HTMLInputWithValue } from '../../types'
import { sanitizeHTMLElementValue } from '../../utils/sanitizeHTMLElementValue'

class ChangeEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, EventType.Change, window)
  }

  async listener(event: InputEvent) {
    const elementTarget = event.target as HTMLInputWithValue
    const gravityEvent = await createGravityEvent(event, this.eventType)
    if (gravityEvent.target != null) {
      gravityEvent.target.value = sanitizeHTMLElementValue(elementTarget)
    }
    this.eventHandler.run(gravityEvent)
  }
}

export default ChangeEventListener
