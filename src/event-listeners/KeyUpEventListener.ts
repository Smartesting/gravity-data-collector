import UserActionHandler from '../user-action/UserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import TargetedEventListener, { TargetedEventListenerOptions } from './TargetedEventListener'

class KeyUpEventListener extends TargetedEventListener {
  constructor(userActionHandler: UserActionHandler, window: Window, options: TargetedEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.KeyUp, window, options)
  }

  listener(event: KeyboardEvent) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options.excludeRegex)
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
