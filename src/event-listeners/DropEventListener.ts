import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class DropEventListener extends TargetedEventListener {
  userActionType = UserActionType.Drop
}
