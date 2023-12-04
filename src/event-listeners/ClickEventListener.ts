import { UserActionType } from '../types'
import TargetedEventListener from './TargetedEventListener'

class ClickEventListener extends TargetedEventListener {
  userActionType = UserActionType.Click
}

export default ClickEventListener
