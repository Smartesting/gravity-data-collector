import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { HTMLInputWithValue, UserActionType } from '../types'
import { sanitizeHTMLElementValue } from '../utils/sanitizeHTMLElementValue'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import { isTextField } from '../utils/listeners'
import IUserActionHandler from '../user-action/IUserActionHandler'

class ChangeEventListener extends TargetedEventListener {
  userActionType = UserActionType.Change

  constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, window, options)
  }

  listener(event: InputEvent) {
    if (isTextField(event.target)) return

    const elementTarget = event.target as HTMLInputWithValue
    const userAction = createTargetedUserAction(event, this.userActionType, this.options)
    if (userAction != null) {
      userAction.target.value = sanitizeHTMLElementValue(elementTarget, { anonymize: false })
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ChangeEventListener
