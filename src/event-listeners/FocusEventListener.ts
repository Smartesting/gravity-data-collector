import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class FocusEventListener extends TargetedEventListener {
  userActionType = UserActionType.Focus
}
