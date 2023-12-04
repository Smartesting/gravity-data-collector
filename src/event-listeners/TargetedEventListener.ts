import EventListener from '../event-listeners/EventListener'
import { CreateSelectorsOptions } from '../types'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { createTargetedUserAction } from '../user-action/createTargetedUserAction'

export interface TargetEventListenerOptions {
  customSelector?: string
  excludeRegex?: RegExp | null
  selectorsOptions?: Partial<CreateSelectorsOptions>
}

export default abstract class TargetedEventListener extends EventListener {
  public constructor(
    userActionHandler: IUserActionHandler,
    window: Window,
    protected readonly options: TargetEventListenerOptions = {},
  ) {
    super(userActionHandler, window)
  }

  public listener(event: Event) {
    const userAction = createTargetedUserAction(event, this.userActionType, this.options)
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }
}
