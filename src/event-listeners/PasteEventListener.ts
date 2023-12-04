import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class PasteEventListener extends TargetedEventListener {
  readonly userActionType = UserActionType.Paste
}
