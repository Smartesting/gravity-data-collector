import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class HashChangeEventListener extends TargetedEventListener {
  userActionType = UserActionType.HashChange
}
