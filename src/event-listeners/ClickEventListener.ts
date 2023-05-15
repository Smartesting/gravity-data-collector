import UserActionHandler from '../user-action/UserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { UserActionType } from '../types'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'

class ClickEventListener extends TargetedEventListener {
  constructor(userActionHandler: UserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.Click, window, options)
  }

  listener(event: MouseEvent) {
    const userAction = createTargetedUserAction(
      event,
      this.userActionType,
      this.options
    )
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ClickEventListener
