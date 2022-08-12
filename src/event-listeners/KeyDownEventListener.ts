import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import EventListener from '../event-listeners/EventListener'
import { UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import UserActionHandler from '../user-action/UserActionHandler'

class KeyDownEventListener extends EventListener {
  constructor(userActionHandler: UserActionHandler, window: Window) {
    super(userActionHandler, UserActionType.KeyDown, window)
  }

  listener(event: KeyboardEvent) {
    const userAction = createTargetedUserAction(event, this.userActionType)
    if (userAction === null) return
    if (isKeyAllowedByKeyListeners(event.code)) {
      return this.userActionHandler.handle(userAction)
    }
    if (isTargetAllowedByKeyListeners(event.target)) {
      this.userActionHandler.handle(userAction)
    }
  }
}

export default KeyDownEventListener
