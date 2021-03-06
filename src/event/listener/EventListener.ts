import EventHandler from '../handler/EventHandler'
import { EventType } from '../../types'

export default abstract class EventListener {
  protected constructor(
    protected readonly eventHandler: EventHandler,
    protected readonly eventType: EventType,
    protected readonly window: Window,
  ) {}

  init(): void {
    this.window.addEventListener(this.eventType, this.listener.bind(this), true)
  }

  protected abstract listener(event: Event): void
}
