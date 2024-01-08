import { UserActionType } from '../types'
import RepeatedEventListener from './RepeatedEventListener'

export default class ScrollEventListener extends RepeatedEventListener {
  userActionType = UserActionType.Scroll
}
