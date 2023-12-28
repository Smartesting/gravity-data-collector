import ITimeoutHandler from './ITimeoutHandler'

export default class MemoryTimeoutHandler implements ITimeoutHandler {
  private sessionTimeout = 0

  constructor(private readonly sessionDuration: number) {
    this.reset()
  }

  isExpired(): boolean {
    return new Date().getTime() >= this.sessionTimeout
  }

  reset(): void {
    this.sessionTimeout = new Date().getTime() + this.sessionDuration
  }
}
