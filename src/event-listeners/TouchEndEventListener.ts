import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class TouchEndEventListener extends TargetedEventListener {
  userActionType = UserActionType.TouchEnd
}
