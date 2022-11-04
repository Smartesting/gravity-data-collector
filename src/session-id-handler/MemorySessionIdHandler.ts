import ISessionIdHandler from './ISessionIdHandler'

export default class MemorySessionIdHandler implements ISessionIdHandler {
  private sessionId?: string

  get(): string {
    if (this.sessionId !== undefined) {
      return this.sessionId
    }
    throw new Error('Set session id before using it')
  }

  isSet(): boolean {
    return this.sessionId !== undefined
  }

  set(sessionId: string): void {
    this.sessionId = sessionId
  }
}
