import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'
import { readCookie, setCookie } from '../utils/documentCookie'

const GRAVITY_SESSION_ID_COOKIE_KEY = 'gravity_session_id'

export default class CookieSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  public constructor(makeSessionId: () => string, private readonly win: typeof window) {
    super(makeSessionId)
  }

  protected getSessionId(): string | undefined {
    return readCookie(GRAVITY_SESSION_ID_COOKIE_KEY, this.win)
  }

  protected setSessionId(sessionId: string): void {
    setCookie(GRAVITY_SESSION_ID_COOKIE_KEY, sessionId, this.win)
  }
}
