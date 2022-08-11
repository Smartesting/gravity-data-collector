import EventHandler from '../handler/EventHandler'
import { UserActionType } from '../../types'

export default abstract class EventListener {
  protected constructor(
    protected readonly eventHandler: EventHandler,
    protected readonly userActionType: UserActionType,
    protected readonly window: Window,
  ) {}

  init(): void {
    this.window.addEventListener(this.userActionType, this.listener.bind(this), true)
  }

  protected abstract listener(event: Event): void
}
