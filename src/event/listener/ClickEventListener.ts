import EventHandler from '../handler/EventHandler'
import { createTargetedUserAction } from '../../action/createTargetedUserAction'
import EventListener from './EventListener'
import { UserActionType } from '../../types'

class ClickEventListener extends EventListener {
  constructor(eventHandler: EventHandler, window: Window) {
    super(eventHandler, UserActionType.Click, window)
  }

  listener(event: MouseEvent) {
    const pointerEvent = event as PointerEvent
    if (pointerEvent.pointerType !== undefined && pointerEvent.pointerType !== '') {
      this.eventHandler.run(createTargetedUserAction(event, this.userActionType))
    }
  }
}

export default ClickEventListener
