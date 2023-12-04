import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class ResizeEventListener extends TargetedEventListener {
  userActionType = UserActionType.Resize
}
