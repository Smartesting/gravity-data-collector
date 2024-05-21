import EventListener from '../event-listeners/EventListener'
import { AnonymizationSettings, CreateSelectorsOptions, UserActionType } from '../types'
import IUserActionHandler from '../user-action/IUserActionHandler'
import { createTargetedUserAction, CreateTargetedUserActionOptions } from '../user-action/createTargetedUserAction'

export interface TargetEventListenerOptions {
  selectorsOptions?: Partial<CreateSelectorsOptions>
  getAnonymizationSettings?: () => AnonymizationSettings | undefined
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
    const userAction = this.createTargetedUserAction(event)
    if (userAction !== null) {
      this.userActionHandler.handle(userAction)
    }
  }

  public createTargetedUserAction(event: Event, userActionType?: UserActionType) {
    return createTargetedUserAction(
      event,
      userActionType ?? this.userActionType,
      this.getCreateTargetedUserActionOptions(),
    )
  }

  private getCreateTargetedUserActionOptions(): Partial<CreateTargetedUserActionOptions> {
    return {
      selectorsOptions: this.options.selectorsOptions,
      anonymizationSettings: this.options.getAnonymizationSettings?.(),
    }
  }
}
