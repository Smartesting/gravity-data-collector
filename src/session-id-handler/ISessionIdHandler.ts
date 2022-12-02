export default interface ISessionIdHandler {
  isSet: () => boolean

  get: () => string

  generateNewSessionId: () => void
}

export abstract class BaseSessionIdHandler implements ISessionIdHandler {
  constructor(private readonly makeSessionId: () => string, private readonly sessionDuration: number) {}

  get(): string {
    let sessionId = this.getSessionId()
    if (sessionId === undefined || new Date().getTime() > this.getTimeout()) {
      sessionId = this.makeSessionId()
      this.setSessionId(sessionId)
    }

    this.setTimeout(new Date().getTime() + this.sessionDuration)
    return sessionId
  }

  isSet(): boolean {
    return this.getSessionId() !== undefined
  }

  generateNewSessionId(): void {
    this.setSessionId(this.makeSessionId())
  }

  protected abstract getSessionId(): string | undefined

  protected abstract setSessionId(sessionId: string): void

  protected abstract getTimeout(): number

  protected abstract setTimeout(timeout: number): void
}
