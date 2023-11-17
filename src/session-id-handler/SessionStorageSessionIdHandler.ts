import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'

const GRAVITY_SESSION_STORAGE_KEY_SESSION_ID = 'gravity-session-id'

export default class SessionStorageSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  public constructor(makeSessionId: () => string, private readonly win: typeof window) {
    super(makeSessionId)
  }

  protected getSessionId(): string | undefined {
    return this.win.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID) ?? undefined
  }

  protected setSessionId(sessionId: string): void {
    this.win.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID, sessionId)
  }
}
