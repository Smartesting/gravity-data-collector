import TargetedEventListener from './TargetedEventListener'
import { UserActionType } from '../types'

export default class SubmitEventListener extends TargetedEventListener {
  userActionType = UserActionType.Submit
}
