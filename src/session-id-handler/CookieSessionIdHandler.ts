import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'
import DocumentCookie from '../utils/DocumentCookie'
import { CookieSettings } from '../types'

const GRAVITY_SESSION_ID_COOKIE_KEY = 'gravity_session_id'

export default class CookieSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  private readonly documentCookie: DocumentCookie

  public constructor(makeSessionId: () => string, cookieSettings: CookieSettings, win: typeof window) {
    super(makeSessionId)
    this.documentCookie = new DocumentCookie(cookieSettings, win)
  }

  protected getSessionId(): string | undefined {
    return this.documentCookie.read(GRAVITY_SESSION_ID_COOKIE_KEY)
  }

  protected setSessionId(sessionId: string): void {
    this.documentCookie.write(GRAVITY_SESSION_ID_COOKIE_KEY, sessionId)
  }
}
