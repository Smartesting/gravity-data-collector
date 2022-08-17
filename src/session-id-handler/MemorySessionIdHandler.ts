import SessionIdHandler from './SessionIdHandler'

export default class MemorySessionIdHandler implements SessionIdHandler {
  sessionId: string | undefined

  get(): string {
    if (this.sessionId !== undefined) {
      return this.sessionId
    }
    throw new Error('Set session id before to use it')
  }

  isSet(): boolean {
    return this.sessionId !== undefined
  }

  set(sessionId: string): void {
    this.sessionId = sessionId
  }
}
