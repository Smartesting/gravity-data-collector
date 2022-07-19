import IEventHandler from '../handler/IEventHandler'
import { createGravityEvent } from '../createGravityEvent'
import EventListener from './EventListener'
import { EventType } from '../../types'

class UnloadEventListener extends EventListener {
  constructor(eventHandler: IEventHandler, window: Window) {
    super(eventHandler, EventType.Unload, window)
  }

  async listener(event: Event) {
    this.eventHandler.run(await createGravityEvent(event, this.eventType))
  }
}

export default UnloadEventListener
