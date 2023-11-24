import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class PlayEventListener extends TargetedEventListener {
  userActionType = UserActionType.Play
}
