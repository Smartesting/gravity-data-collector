import EventListener from '../event-listeners/EventListener'
import { CreateSelectorsOptions, UserActionType } from '../types'
import IUserActionHandler from '../user-action/IUserActionHandler'

export interface TargetEventListenerOptions {
  customSelector?: string
  excludeRegex?: RegExp | null
  selectorsOptions?: Partial<CreateSelectorsOptions>
}

export default abstract class TargetedEventListener extends EventListener {
  protected constructor(
    userActionHandler: IUserActionHandler,
    userActionType: UserActionType,
    window: Window,
    protected readonly options: TargetEventListenerOptions,
  ) {
    super(userActionHandler, userActionType, window)
  }
}
