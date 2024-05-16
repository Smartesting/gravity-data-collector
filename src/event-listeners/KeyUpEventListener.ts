import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import TargetedEventListener from './TargetedEventListener'

class KeyUpEventListener extends TargetedEventListener {
  userActionType = UserActionType.KeyUp

  listener(event: KeyboardEvent) {
    const userAction = createTargetedUserAction(
      event,
      this.userActionType,
      this.options,
    )
    if (userAction === null) return
    if (isKeyAllowedByKeyListeners(event.code)) {
      return this.userActionHandler.handle(userAction)
    }
    if (isTargetAllowedByKeyListeners(event.target)) {
      this.userActionHandler.handle(userAction)
    }
  }
}

export default KeyUpEventListener
