import { UserActionType } from '../types'
import RepeatedEventListener from './RepeatedEventListener'

export default class WheelEventListener extends RepeatedEventListener {
  userActionType = UserActionType.Wheel
}
