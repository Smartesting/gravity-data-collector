import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class CutEventListener extends TargetedEventListener {
  userActionType = UserActionType.Cut
}
