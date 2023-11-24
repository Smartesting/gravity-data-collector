import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class SelectEventListener extends TargetedEventListener {
  userActionType = UserActionType.Select
}
