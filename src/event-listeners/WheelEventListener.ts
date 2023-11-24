import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class WheelEventListener extends TargetedEventListener {
  userActionType = UserActionType.Wheel
}
