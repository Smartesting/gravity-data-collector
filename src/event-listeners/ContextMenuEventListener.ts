import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { UserActionType } from '../types'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'

export default class ContextMenuEventListener extends TargetedEventListener {
  constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.ContextMenu, window, options)
  }

  listener(event: MouseEvent) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options)
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }
}
