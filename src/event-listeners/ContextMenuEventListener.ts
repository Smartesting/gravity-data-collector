import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class ContextMenuEventListener extends TargetedEventListener {
  userActionType = UserActionType.ContextMenu
}
