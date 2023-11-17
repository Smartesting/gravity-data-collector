import { readCookie, setCookie } from '../utils/documentCookie'
import ITimeoutHandler from './ITimeoutHandler'

const GRAVITY_SESSION_TIMEOUT_COOKIE_KEY = 'gravity_session_timeout'

export default class CookieTimeoutHandler implements ITimeoutHandler {
  public constructor(private readonly sessionDuration: number, private readonly win: typeof window) {
    this.resetTimeout()
  }

  isExpired(): boolean {
    const stored = readCookie(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY, this.win)
    if (stored === undefined) {
      this.resetTimeout()
      return false
    }
    const isExpired = new Date().getTime() >= parseInt(stored)
    if (isExpired) this.resetTimeout()
    return isExpired
  }

  private resetTimeout() {
    const timeout = new Date().getTime() + this.sessionDuration
    setCookie(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY, timeout.toString(), this.win)
  }
}
