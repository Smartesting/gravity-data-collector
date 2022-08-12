import UserActionHandler from '../user-action/UserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import EventListener from '../event-listeners/EventListener'
import { HTMLInputWithValue, TargetedUserAction, UserActionType } from '../types'
import { sanitizeHTMLElementValue } from '../utils/sanitizeHTMLElementValue'

class ChangeEventListener extends EventListener {
  constructor(userActionHandler: UserActionHandler, window: Window) {
    super(userActionHandler, UserActionType.Change, window)
  }

  listener(event: InputEvent) {
    const elementTarget = event.target as HTMLInputWithValue
    const userAction: TargetedUserAction | null = createTargetedUserAction(event, this.userActionType)
    if (userAction != null) {
      userAction.target.value = sanitizeHTMLElementValue(elementTarget)
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ChangeEventListener
