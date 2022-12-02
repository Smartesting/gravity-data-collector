import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'
import { readCookie, setCookie } from '../utils/documentCookie'

const GRAVITY_SESSION_ID_COOKIE_KEY = 'gravity_session_id'
const GRAVITY_SESSION_TIMEOUT_COOKIE_KEY = 'gravity_session_timeout'

export default class CookieSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  protected getSessionId(): string | undefined {
    return readCookie(GRAVITY_SESSION_ID_COOKIE_KEY)
  }

  protected setSessionId(sessionId: string): void {
    setCookie(GRAVITY_SESSION_ID_COOKIE_KEY, sessionId)
  }

  protected getTimeout(): number {
    const stored = readCookie(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY)
    return stored !== undefined ? parseInt(stored) : new Date().getTime() - 1
  }

  protected setTimeout(timeout: number) {
    setCookie(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY, timeout.toString())
  }
}
