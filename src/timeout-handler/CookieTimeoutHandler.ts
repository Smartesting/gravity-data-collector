import DocumentCookie from '../utils/DocumentCookie'
import ITimeoutHandler from './ITimeoutHandler'
import { CookieSettings } from '../types'

const GRAVITY_SESSION_TIMEOUT_COOKIE_KEY = 'gravity_session_timeout'

export default class CookieTimeoutHandler implements ITimeoutHandler {
  private readonly documentCookie: DocumentCookie

  public constructor(private readonly sessionDuration: number, cookieSettings: CookieSettings, win: typeof window) {
    this.documentCookie = new DocumentCookie(cookieSettings, win)

    const stored = this.documentCookie.read(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY)
    if (stored === undefined) {
      this.reset()
    }
  }

  isExpired(): boolean {
    const stored = this.documentCookie.read(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY)
    if (stored === undefined) {
      return false
    }
    return new Date().getTime() >= parseInt(stored)
  }

  reset() {
    const timeout = new Date().getTime() + this.sessionDuration
    this.documentCookie.write(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY, timeout.toString())
  }
}
