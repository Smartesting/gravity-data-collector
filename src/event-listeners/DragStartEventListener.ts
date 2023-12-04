import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class DragStartEventListener extends TargetedEventListener {
  userActionType = UserActionType.DragStart
}
