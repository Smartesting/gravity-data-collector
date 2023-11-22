export default interface ISessionIdHandler {
  isSet: () => boolean

  get: () => string

  generateNewSessionId: () => void
}

export abstract class BaseSessionIdHandler implements ISessionIdHandler {
  constructor(private readonly makeSessionId: () => string) {}

  get(): string {
    let sessionId = this.getSessionId()
    if (sessionId === undefined) {
      sessionId = this.makeSessionId()
      this.setSessionId(sessionId)
    }
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
}
