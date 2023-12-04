import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class TouchStartEventListener extends TargetedEventListener {
  userActionType = UserActionType.TouchStart
}
