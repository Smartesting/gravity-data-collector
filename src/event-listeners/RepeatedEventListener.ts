import TargetedEventListener from './TargetedEventListener'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import { TargetedUserAction } from '../types'
import isTargetedUserAction from '../utils/isTargetedUserAction'
import { sameJSONObjects } from '../utils/SameJSONObjects'

export default abstract class RepeatedEventListener extends TargetedEventListener {
  private readonly userActionHistory: UserActionsHistory = new MemoryUserActionsHistory()

  public listener(event: Event) {
    const userAction = this.createTargetedUserAction(event)

    if (userAction !== null) {
      if (!this.sameActionThanLast(userAction)) {
        this.userActionHistory.push(userAction)
        super.listener(event)
      }
    }
  }

  private sameActionThanLast(targetedUserAction: TargetedUserAction): boolean {
    const lastUserAction = this.userActionHistory.getLast()

    if (lastUserAction === undefined) return false
    if (!isTargetedUserAction(lastUserAction)) return false

    return sameJSONObjects(
      this.makeComparableUserAction(targetedUserAction),
      this.makeComparableUserAction(lastUserAction),
    )
  }

  protected makeComparableUserAction({ type, target }: TargetedUserAction): any {
    const { element, selectors } = target
    return { type, target: { element, selectors } }
  }
}
