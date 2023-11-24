import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class TouchMoveEventListener extends TargetedEventListener {
  userActionType = UserActionType.TouchMove
}
