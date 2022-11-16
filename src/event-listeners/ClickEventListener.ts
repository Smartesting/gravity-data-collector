import UserActionHandler from '../user-action/UserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { UserActionType } from '../types'
import TargetedEventListener, { TargetedEventListenerOptions } from './TargetedEventListener'

class ClickEventListener extends TargetedEventListener {
  constructor(userActionHandler: UserActionHandler, window: Window, options: TargetedEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.Click, window, options)
  }

  listener(event: MouseEvent) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options.excludeRegex)
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ClickEventListener
