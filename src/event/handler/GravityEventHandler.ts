import IEventHandler from '../../event/handler/IEventHandler'
import { EventType, GravityEventHandlerOptions, SessionEvent, TEvent } from '../../types'
import { buildGravityTrackingApiUrl } from '../../event/handler/configuration'
import fetch from 'cross-fetch'

export class GravityEventHandler implements IEventHandler {
  private readonly buffer: SessionEvent[] = []
  private readonly timer?: NodeJS.Timer

  constructor(
    private readonly sessionId: string,
    private readonly options: GravityEventHandlerOptions,
    private readonly successCallback: (payload: any) => void = console.log,
    private readonly errorCallback: (reason: string) => void = console.error,
  ) {
    if (options.delay > 0) {
      this.timer = setInterval(() => {
        void this.flush()
      }, options.delay)
    }
  }

  async run(event: TEvent) {
    this.buffer.push(this.toSessionEvent(event))
    if (this.timer == null) {
      await this.flush()
      return
    }
    if (event.type === EventType.Unload) {
      clearInterval(this.timer)
      await this.flush()
    }
  }

  async flush() {
    if (this.buffer.length === 0) {
      return
    }
    await this.send(this.buffer.splice(0, this.buffer.length))
  }

  async send(buffer: SessionEvent[]) {
    try {
      const response = await fetch(buildGravityTrackingApiUrl(this.options.authKey), {
        method: 'POST',
        body: JSON.stringify(buffer),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 200) {
        this.successCallback(await response.json())
      } else {
        this.errorCallback(`error ${response.status}, ${response.statusText}`)
      }
    } catch (err: any) {
      this.errorCallback(err.message)
    }
  }

  private toSessionEvent(event: TEvent): SessionEvent {
    return {
      sessionId: this.sessionId,
      ...event,
    }
  }
}
