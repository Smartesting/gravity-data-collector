import MovementHandler from '../movement/MovementHandler'
import { createTargetedUserAction } from '../movement/createTargetedUserAction'
import { UserActionType } from '../types'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'

class ClickEventListener extends TargetedEventListener {
  constructor(userActionHandler: MovementHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.Click, window, options)
  }

  listener(event: MouseEvent) {
    const userAction = createTargetedUserAction(
      event,
      this.userActionType,
      this.options.excludeRegex,
      this.options.customSelector,
    )
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ClickEventListener
