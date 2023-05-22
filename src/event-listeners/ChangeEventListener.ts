import UserActionHandler from '../user-action/UserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { HTMLInputWithValue, TargetedUserAction, UserActionType } from '../types'
import { sanitizeHTMLElementValue } from '../utils/sanitizeHTMLElementValue'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'

class ChangeEventListener extends TargetedEventListener {
  constructor(userActionHandler: UserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.Change, window, options)
  }

  listener(event: InputEvent) {
    const elementTarget = event.target as HTMLInputWithValue
    const userAction: TargetedUserAction | null = createTargetedUserAction(event, this.userActionType, this.options)
    if (userAction != null) {
      userAction.target.value = sanitizeHTMLElementValue(elementTarget)
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ChangeEventListener
