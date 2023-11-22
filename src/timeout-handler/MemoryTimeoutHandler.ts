import ITimeoutHandler from './ITimeoutHandler'

export default class MemoryTimeoutHandler implements ITimeoutHandler {
  private sessionTimeout: number

  constructor(private readonly sessionDuration: number) {
    this.sessionTimeout = new Date().getTime() + sessionDuration
  }

  isExpired(): boolean {
    const isExpired = new Date().getTime() >= this.sessionTimeout
    if (isExpired) {
      this.sessionTimeout = new Date().getTime() + this.sessionDuration
    }
    return isExpired
  }
}
