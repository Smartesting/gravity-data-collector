import UserActionHandler from '../user-action/UserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import EventListener from '../event-listeners/EventListener'
import { UserActionType } from '../types'

class ClickEventListener extends EventListener {
  constructor(userActionHandler: UserActionHandler, window: Window) {
    super(userActionHandler, UserActionType.Click, window)
  }

  listener(event: MouseEvent) {
    const pointerEvent = event as PointerEvent
    if (pointerEvent.pointerType !== undefined && pointerEvent.pointerType !== '') {
      const userAction = createTargetedUserAction(event, this.userActionType)
      if (userAction !== null)
        this.userActionHandler.handle(userAction)
    }
  }
}

export default ClickEventListener
