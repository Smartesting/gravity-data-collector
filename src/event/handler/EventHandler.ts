import { EventType, SessionEvent, TEvent } from '../../types'

export default class EventHandler {
  private readonly buffer: SessionEvent[] = []
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionId: string,
    private readonly requestInterval: number,
    private readonly output: (sessionEvents: SessionEvent[]) => void,
  ) {
    if (requestInterval > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, requestInterval)
    }
  }

  run(event: TEvent) {
    this.buffer.push(this.toSessionEvent(event))
    if (this.timer == null) {
      this.flush()
      return
    }
    if (event.type === EventType.Unload) {
      clearInterval(this.timer)
      this.flush()
    }
  }

  flush() {
    if (this.buffer.length === 0) {
      return
    }
    this.output(this.buffer.splice(0, this.buffer.length))
  }

  private toSessionEvent(event: TEvent): SessionEvent {
    return {
      sessionId: this.sessionId,
      ...event,
    }
  }
}
