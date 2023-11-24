import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class CopyEventListener extends TargetedEventListener {
  userActionType = UserActionType.Copy
}
