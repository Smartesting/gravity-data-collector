import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class DblClickEventListener extends TargetedEventListener {
  userActionType = UserActionType.DblClick
}
