import EventHandler from '../handler/EventHandler'
import { createTargetedUserAction } from '../../action/createTargetedUserAction'
import EventListener from './EventListener'
import { UserActionType } from '../../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../../utils/listeners'

class KeyDownEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, UserActionType.KeyDown, window)
  }

  listener(event: KeyboardEvent) {
    if (isKeyAllowedByKeyListeners(event.code)) {
      return this.eventHandler.run(createTargetedUserAction(event, this.userActionType))
    }

    if (isTargetAllowedByKeyListeners(event.target)) {
      this.eventHandler.run(createTargetedUserAction(event, this.userActionType))
    }
  }
}

export default KeyDownEventListener
