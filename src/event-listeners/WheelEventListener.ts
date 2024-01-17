import { TargetedUserAction, UserActionType } from '../types'
import RepeatedEventListener from './RepeatedEventListener'

export default class WheelEventListener extends RepeatedEventListener {
  userActionType = UserActionType.Wheel

  makeComparableUserAction({ type }: TargetedUserAction) {
    return type
  }
}
