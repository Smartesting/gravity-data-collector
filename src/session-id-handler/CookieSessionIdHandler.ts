import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'
import psl from 'psl'

const GRAVITY_SESSION_ID_COOKIE_KEY = 'gravity_session_id'
const GRAVITY_SESSION_TIMEOUT_COOKIE_KEY = 'gravity_session_timeout'

export default class CookieSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  protected getSessionId(): string | undefined {
    return this.readCookie(GRAVITY_SESSION_ID_COOKIE_KEY)
  }

  protected setSessionId(sessionId: string): void {
    this.setCookie(GRAVITY_SESSION_ID_COOKIE_KEY, sessionId)
  }

  protected getTimeout(): number {
    const stored = this.readCookie(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY)

    return stored !== undefined ? parseInt(stored) : new Date().getTime() - 1
  }

  protected setTimeout(timeout: number) {
    this.setCookie(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY, timeout.toString())
  }

  private setCookie(key: string, value: string) {
    let cookie = `${key}=${value}`
    const parsedDomain = psl.parse(document.location.hostname)
    if (isParsedDomain(parsedDomain) && parsedDomain.domain !== null) {
      const domain: string = parsedDomain.domain
      cookie += `; domain=${domain}`
    }

    document.cookie = cookie
  }

  private readCookie(key: string) {
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`))

    return match !== null ? match[2] : undefined
  }
}

function isParsedDomain(toBeDetermined: any): toBeDetermined is psl.ParsedDomain {
  return (toBeDetermined as psl.ParsedDomain).error === undefined
}
