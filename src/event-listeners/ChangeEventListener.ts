import MovementHandler from '../movement/MovementHandler'
import { createTargetedUserAction } from '../movement/createTargetedUserAction'
import { HTMLInputWithValue, TargetedUserAction, UserActionType } from '../types'
import { sanitizeHTMLElementValue } from '../utils/sanitizeHTMLElementValue'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'

class ChangeEventListener extends TargetedEventListener {
  constructor(userActionHandler: MovementHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, UserActionType.Change, window, options)
  }

  listener(event: InputEvent) {
    const elementTarget = event.target as HTMLInputWithValue
    const userAction: TargetedUserAction | null = createTargetedUserAction(
      event,
      this.userActionType,
      this.options.excludeRegex,
      this.options.customSelector,
    )
    if (userAction != null) {
      userAction.target.value = sanitizeHTMLElementValue(elementTarget)
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ChangeEventListener
