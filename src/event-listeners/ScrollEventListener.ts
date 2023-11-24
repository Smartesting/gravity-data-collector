import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class ScrollEventListener extends TargetedEventListener {
  userActionType = UserActionType.Scroll
}
