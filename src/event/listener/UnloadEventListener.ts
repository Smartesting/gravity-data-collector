import EventHandler from '../handler/EventHandler'
import EventListener from './EventListener'
import { UserActionType } from '../../types'
import { createTargetedUserAction } from '../../action/createTargetedUserAction'

export const UNLOAD_USER_ACTION_TYPE = 'unload' as UserActionType

class UnloadEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, UNLOAD_USER_ACTION_TYPE, window)
  }

  async listener(event: Event) {
    this.eventHandler.run(
      createTargetedUserAction(
        {
          ...event,
          target: null,
        },
        UNLOAD_USER_ACTION_TYPE,
      ),
    )
  }
}

export default UnloadEventListener
