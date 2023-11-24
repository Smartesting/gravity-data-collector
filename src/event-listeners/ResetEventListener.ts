import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class ResetEventListener extends TargetedEventListener {
  userActionType = UserActionType.Reset
}
