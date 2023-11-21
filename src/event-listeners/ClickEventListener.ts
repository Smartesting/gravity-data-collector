import { UserActionType } from '../types'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'

class ClickEventListener extends TargetedEventListener {
  constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.Click, window, options)
  }
}

export default ClickEventListener
