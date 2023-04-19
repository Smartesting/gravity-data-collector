import MovementHandler from '../movement/MovementHandler'
import { createTargetedUserAction } from '../movement/createTargetedUserAction'
import { UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'

class KeyUpEventListener extends TargetedEventListener {
  constructor(userActionHandler: MovementHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.KeyUp, window, options)
  }

  listener(event: KeyboardEvent) {
    const userAction = createTargetedUserAction(
      event,
      this.userActionType,
      this.options.excludeRegex,
      this.options.customSelector,
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
