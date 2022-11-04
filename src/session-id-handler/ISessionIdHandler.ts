export default interface ISessionIdHandler {
  isSet: () => boolean

  get: () => string

  set: (sessionId: string) => void
}

export class BaseSessionIdHandler implements ISessionIdHandler {
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

  set(sessionId: string): void {
    this.setSessionId(sessionId)
  }

  protected getSessionId(): string | undefined {
    throw new Error('To be implemented')
  }

  protected setSessionId(sessionId: string): void {
    throw new Error('To be implemented')
  }

  protected getTimeout(): number {
    throw new Error('To be implemented')
  }

  protected setTimeout(timeout: number) {
    throw new Error('To be implemented')
  }
}
