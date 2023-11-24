import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class MouseEnterEventListener extends TargetedEventListener {
  userActionType = UserActionType.MouseEnter
}
