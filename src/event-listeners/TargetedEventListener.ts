import UserActionHandler from '../user-action/UserActionHandler'
import EventListener from '../event-listeners/EventListener'
import { UserActionType } from '../types'

export interface TargetedEventListenerOptions {
  excludeRegex?: RegExp | null
}

export default abstract class TargetedEventListener extends EventListener {
  protected constructor(
    userActionHandler: UserActionHandler,
    userActionType: UserActionType,
    window: Window,
    protected readonly options: TargetedEventListenerOptions,
  ) {
    super(userActionHandler, userActionType, window)
  }
}
