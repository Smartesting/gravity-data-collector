import EventHandler from '../handler/EventHandler'
import { createTargetedUserAction } from '../../action/createTargetedUserAction'
import EventListener from './EventListener'
import { UserActionType, HTMLInputWithValue } from '../../types'
import { sanitizeHTMLElementValue } from '../../utils/sanitizeHTMLElementValue'

class ChangeEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, UserActionType.Change, window)
  }

  listener(event: InputEvent) {
    const elementTarget = event.target as HTMLInputWithValue
    const gravityEvent = createTargetedUserAction(event, this.userActionType)
    if (gravityEvent.target != null) {
      gravityEvent.target.value = sanitizeHTMLElementValue(elementTarget)
    }
    this.eventHandler.run(gravityEvent)
  }
}

export default ChangeEventListener
