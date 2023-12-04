import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class ToggleEventListener extends TargetedEventListener {
  userActionType = UserActionType.Toggle
}
