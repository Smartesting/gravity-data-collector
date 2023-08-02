import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { UserActionType } from '../types'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'

class ClickEventListener extends TargetedEventListener {
  constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.Click, window, options)
  }

  listener(event: MouseEvent) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options)
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ClickEventListener
