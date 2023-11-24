import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class BlurEventListener extends TargetedEventListener {
  userActionType = UserActionType.Blur
}
