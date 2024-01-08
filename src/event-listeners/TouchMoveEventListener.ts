import { UserActionType } from '../types'
import RepeatedEventListener from './RepeatedEventListener'

export default class TouchMoveEventListener extends RepeatedEventListener {
  userActionType = UserActionType.TouchMove
}
