import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class MouseLeaveEventListener extends TargetedEventListener {
  userActionType = UserActionType.MouseLeave
}
