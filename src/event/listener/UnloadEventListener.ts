import EventHandler from '../handler/EventHandler'
import EventListener from './EventListener'
import { EventType } from '../../types'
import { createGravityEvent } from '../createGravityEvent'

export const UNLOAD_EVENT_TYPE = 'unload' as EventType

class UnloadEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, UNLOAD_EVENT_TYPE, window)
  }

  async listener(event: Event) {
    this.eventHandler.run(
      createGravityEvent(
        {
          ...event,
          target: null,
        },
        UNLOAD_EVENT_TYPE,
      ),
    )
  }
}

export default UnloadEventListener
