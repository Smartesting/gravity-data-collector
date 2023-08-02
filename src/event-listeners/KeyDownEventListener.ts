import { createTargetedUserAction } from '../user-action/createTargetedUserAction'
import { HTMLInputWithValue, KeyUserActionData, TargetedUserAction, UserActionType } from '../types'
import { isKeyAllowedByKeyListeners, isTargetAllowedByKeyListeners, recordChangeEvent } from '../utils/listeners'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import TargetedEventListener, { TargetEventListenerOptions } from './TargetedEventListener'
import isTargetedUserAction from '../utils/isTargetedUserAction'
import { sanitizeHTMLElementValue } from '../utils/sanitizeHTMLElementValue'
import IUserActionHandler from '../user-action/IUserActionHandler'

class KeyDownEventListener extends TargetedEventListener {
  constructor(
    userActionHandler: IUserActionHandler,
    window: Window,
    private readonly userActionHistory: UserActionsHistory,
    options: TargetEventListenerOptions = {},
  ) {
    super(userActionHandler, UserActionType.KeyDown, window, options)
  }

  listener(event: KeyboardEvent) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options)
    if (userAction === null || this.actionIsTheSameThanLast(userAction)) return

    if (recordChangeEvent(event.code, event.target)) {
      const changeUserAction = createTargetedUserAction(event, UserActionType.Change, this.options)
      if (changeUserAction != null && !this.changeActionIsSame(changeUserAction)) {
        changeUserAction.target.value = sanitizeHTMLElementValue(event.target as HTMLInputWithValue)
        return this.userActionHandler.handle(changeUserAction)
      }
    }

    if (isKeyAllowedByKeyListeners(event.code)) {
      return this.userActionHandler.handle(userAction)
    }

    if (isTargetAllowedByKeyListeners(event.target)) {
      this.userActionHandler.handle(userAction)
    }
  }

  changeActionIsSame(changeUserAction: TargetedUserAction): boolean {
    const lastUserAction = this.userActionHistory.getLast()

    if (lastUserAction === undefined) return false
    if (!isTargetedUserAction(lastUserAction)) return false

    return compareTargetedUserAction(changeUserAction, lastUserAction)
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
  const { element, selector, selectors } = target

  return { type, target: { element, selector, selectors } }
}

function sameJSONObjects<T>(o1: T, o2: T): boolean {
  return JSON.stringify(o1) === JSON.stringify(o2)
}

export default KeyDownEventListener
