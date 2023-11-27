import { UserActionType } from '../types'
import { IEventListener } from './IEventListener'
import IUserActionHandler from '../user-action/IUserActionHandler'

export default abstract class EventListener implements IEventListener {
  private readonly listenerBind
  abstract readonly userActionType: UserActionType
  protected constructor(protected readonly userActionHandler: IUserActionHandler, protected readonly window: Window) {
    this.listenerBind = this.listener.bind(this)
  }

  init(): void {
    this.window.addEventListener(this.userActionType, this.listenerBind, true)
  }

  terminate(): void {
    this.window.removeEventListener(this.userActionType, this.listenerBind, true)
  }

  protected abstract listener(event: Event): void
}
