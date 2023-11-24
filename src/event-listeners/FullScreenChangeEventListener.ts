import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class FullScreenChangeEventListener extends TargetedEventListener {
  userActionType = UserActionType.FullScreenChange
}
