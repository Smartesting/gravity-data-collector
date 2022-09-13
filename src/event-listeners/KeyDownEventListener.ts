import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import EventListener from '../event-listeners/EventListener'
import { KeyUserActionData, TargetedUserAction, UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import UserActionHandler from '../user-action/UserActionHandler'
import UserActionHistory from '../user-actions-history/UserActionHistory'

class KeyDownEventListener extends EventListener {
  constructor(
    userActionHandler: UserActionHandler,
    window: Window,
    private readonly userActionHistory: UserActionHistory,
  ) {
    super(userActionHandler, UserActionType.KeyDown, window)
  }

  listener(event: KeyboardEvent) {
    const userAction = createTargetedUserAction(event, this.userActionType)
    if (userAction === null || this.actionIsTheSameThanLast(userAction)) return

    if (isKeyAllowedByKeyListeners(event.code)) {
      return this.userActionHandler.handle(userAction)
    }

    if (isTargetAllowedByKeyListeners(event.target)) {
      this.userActionHandler.handle(userAction)
    }
  }

  actionIsTheSameThanLast(userAction: TargetedUserAction): boolean {
    const lastUserAction = this.userActionHistory.getLast()
    if (lastUserAction === undefined || lastUserAction.type !== UserActionType.KeyDown) return false

    const targetedUserAction = lastUserAction as TargetedUserAction

    if (targetedUserAction.target.element !== userAction.target.element) return false
    if (targetedUserAction.target.selector !== userAction.target.selector) return false

    if (
      (targetedUserAction.userActionData as KeyUserActionData).key !==
      (userAction.userActionData as KeyUserActionData).key
    ) {
      return false
    }

    return (
      (targetedUserAction.userActionData as KeyUserActionData).code ===
      (userAction.userActionData as KeyUserActionData).code
    )
  }
}

export default KeyDownEventListener
