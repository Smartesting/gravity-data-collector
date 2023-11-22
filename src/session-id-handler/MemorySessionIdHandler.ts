import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'

export default class MemorySessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  private sessionId?: string

  protected getSessionId(): string | undefined {
    return this.sessionId
  }

  protected setSessionId(sessionId: string): void {
    this.sessionId = sessionId
  }
}
