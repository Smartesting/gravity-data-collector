import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'

export default class MemorySessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  private sessionId?: string
  private sessionTimeout: number = new Date().getTime() - 1

  protected getSessionId(): string | undefined {
    return this.sessionId
  }

  protected setSessionId(sessionId: string): void {
    this.sessionId = sessionId
  }

  protected getTimeout(): number {
    return this.sessionTimeout
  }

  protected setTimeout(timeout: number) {
    this.sessionTimeout = timeout
  }
}
