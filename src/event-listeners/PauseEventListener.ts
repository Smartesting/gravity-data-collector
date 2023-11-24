import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class PauseEventListener extends TargetedEventListener {
  userActionType = UserActionType.Pause
}
