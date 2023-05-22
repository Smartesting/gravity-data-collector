import UserActionHandler from '../user-action/UserActionHandler'
import EventListener from '../event-listeners/EventListener'
import { CreateSelectorsOptions, UserActionType } from '../types'

export interface TargetEventListenerOptions {
  customSelector?: string
  excludeRegex?: RegExp | null
  selectorsOptions?: Partial<CreateSelectorsOptions>
}

export default abstract class TargetedEventListener extends EventListener {
  protected constructor(
    userActionHandler: UserActionHandler,
    userActionType: UserActionType,
    window: Window,
    protected readonly options: TargetEventListenerOptions,
  ) {
    super(userActionHandler, userActionType, window)
  }
}
