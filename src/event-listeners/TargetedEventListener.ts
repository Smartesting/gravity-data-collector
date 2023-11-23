import EventListener from '../event-listeners/EventListener'
import { CreateSelectorsOptions, UserActionType } from '../types'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'

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

  public listener(event: Event) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options)
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }
}
