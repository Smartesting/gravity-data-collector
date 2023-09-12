import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'

const GRAVITY_SESSION_STORAGE_KEY_SESSION_ID = 'gravity-session-id'
const GRAVITY_SESSION_STORAGE_KEY_TIMEOUT = 'gravity-session-timeout'

export default class SessionStorageSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  public constructor(
      makeSessionId: () => string,
      sessionDuration: number,
      private readonly win: typeof window,
  ) {
    super(makeSessionId, sessionDuration)
  }

  protected getSessionId(): string | undefined {
    return this.win.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID) ?? undefined
  }

  protected setSessionId(sessionId: string): void {
    this.win.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID, sessionId)
  }

  protected getTimeout(): number {
    const stored = this.win.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_TIMEOUT)

    return stored !== null ? parseInt(stored) : new Date().getTime() - 1
  }

  protected setTimeout(timeout: number) {
    this.win.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_TIMEOUT, timeout.toString())
  }
}
