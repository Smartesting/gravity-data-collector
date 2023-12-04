import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class TouchCancelEventListener extends TargetedEventListener {
  userActionType = UserActionType.TouchCancel
}
