import { DEFAULT_ANONYMIZATION_SETTINGS, HTMLInputWithValue, UserActionType } from '../types'
import { sanitizeHTMLElementValue } from '../utils/sanitizeHTMLElementValue'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'

class ChangeEventListener extends TargetedEventListener {
  userActionType = UserActionType.Change

  constructor(userActionHandler: IUserActionHandler, window: Window, options: TargetEventListenerOptions = {}) {
    super(userActionHandler, window, options)
  }

  listener(event: InputEvent) {
    const elementTarget = event.target as HTMLInputWithValue
    const userAction = this.createTargetedUserAction(event)
    if (userAction != null) {
      if (userAction.target.type === 'checkbox') {
        userAction.target.value = (event.target as HTMLInputElement).checked.toString()
      } else {
        userAction.target.value = sanitizeHTMLElementValue(
          elementTarget,
          this.options.getAnonymizationSettings?.() ?? DEFAULT_ANONYMIZATION_SETTINGS,
        )
      }
      this.userActionHandler.handle(userAction)
    }
  }
}

export default ChangeEventListener
