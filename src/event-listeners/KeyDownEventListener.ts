import { KeyUserActionData, TargetedUserAction, UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners } from '../utils/listeners'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import TargetedEventListener from './TargetedEventListener'
import isTargetedUserAction from '../utils/isTargetedUserAction'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import { sameJSONObjects } from '../utils/SameJSONObjects'

class KeyDownEventListener extends TargetedEventListener {
  private readonly userActionHistory: UserActionsHistory = new MemoryUserActionsHistory()
  userActionType = UserActionType.KeyDown

  listener(event: KeyboardEvent) {
    const userAction = this.createTargetedUserAction(event)
    if (userAction === null || this.actionIsTheSameThanLast(userAction)) return

    if (isKeyAllowedByKeyListeners(event.code) || isTargetAllowedByKeyListeners(event.target)) {
      this.userActionHistory.push(userAction)
      this.userActionHandler.handle(userAction)
    }
  }

  actionIsTheSameThanLast(userAction: TargetedUserAction): boolean {
    const lastUserAction = this.userActionHistory.getLast()

    if (lastUserAction === undefined) return false
    if (!isTargetedUserAction(lastUserAction)) return false
    if (lastUserAction.type !== UserActionType.KeyDown) return false
    if (!compareTargetedUserAction(lastUserAction, userAction)) return false

    const targetedUserAction = lastUserAction
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

function compareTargetedUserAction(tua1: TargetedUserAction, tua2: TargetedUserAction): boolean {
  return sameJSONObjects(makeMinimalTargetedUserAction(tua1), makeMinimalTargetedUserAction(tua2))
}

function makeMinimalTargetedUserAction(userAction: TargetedUserAction) {
  const { type, target } = userAction
  const { element, selectors } = target

  return { type, target: { element, selectors } }
}

export default KeyDownEventListener
