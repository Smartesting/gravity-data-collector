import UserActionHandler from '../user-action/UserActionHandler'
import { UserActionType } from '../types'

export default abstract class EventListener {
  private readonly listenerBind

  protected constructor(
    protected readonly userActionHandler: UserActionHandler,
    protected readonly userActionType: UserActionType,
    protected readonly window: Window,
  ) {
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
