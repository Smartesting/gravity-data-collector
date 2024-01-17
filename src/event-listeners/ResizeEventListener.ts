import { TargetedUserAction, UserActionType } from '../types'
import RepeatedEventListener from './RepeatedEventListener'

export default class ResizeEventListener extends RepeatedEventListener {
  userActionType = UserActionType.Resize

  makeComparableUserAction({ type }: TargetedUserAction) {
    return type
  }
}
