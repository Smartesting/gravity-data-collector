import { createTargetedUserAction } from '../movement/createTargetedUserAction'
import { KeyUserActionData, TargetedUserAction, UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import MovementHandler from '../movement/MovementHandler'
import MovementsHistory from '../movement-history/MovementsHistory'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'

class KeyDownEventListener extends TargetedEventListener {
  constructor(
    userActionHandler: MovementHandler,
    window: Window,
    private readonly userActionHistory: MovementsHistory,
    options: TargetEventListenerOptions = {},
  ) {
    super(userActionHandler, UserActionType.KeyDown, window, options)
  }

  listener(event: KeyboardEvent) {
    const userAction = createTargetedUserAction(
      event,
      this.userActionType,
      this.options.excludeRegex,
      this.options.customSelector,
    )
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
