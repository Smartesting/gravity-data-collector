import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class SeekedEventListener extends TargetedEventListener {
  userActionType = UserActionType.Seeked
}
