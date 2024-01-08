import TargetedEventListener from './TargetedEventListener'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import { TargetedUserAction } from '../types'
import isTargetedUserAction from '../utils/isTargetedUserAction'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'

export default abstract class RepeatedEventListener extends TargetedEventListener {
  private readonly userActionHistory: UserActionsHistory = new MemoryUserActionsHistory()

  public listener(event: Event) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options)

    if (userAction !== null) {
      if (!this.sameActionThanLast(userAction)) {
        this.userActionHistory.push(userAction)
        super.listener(event)
      }
    }
  }

  sameActionThanLast(targetedUserAction: TargetedUserAction): boolean {
    const lastUserAction = this.userActionHistory.getLast()

    if (lastUserAction === undefined) return false
    if (!isTargetedUserAction(lastUserAction)) return false

    return compareTargetedUserAction(targetedUserAction, lastUserAction)
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
