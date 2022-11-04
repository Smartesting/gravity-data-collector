import ISessionIdHandler, { BaseSessionIdHandler } from './ISessionIdHandler'

const GRAVITY_SESSION_STORAGE_KEY_SESSION_ID = 'gravity-session-id'
const GRAVITY_SESSION_STORAGE_KEY_TIMEOUT = 'gravity-session-timeout'

export default class SessionStorageSessionIdHandler extends BaseSessionIdHandler implements ISessionIdHandler {
  protected getSessionId(): string | undefined {
    return window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID) ?? undefined
  }

  protected setSessionId(sessionId: string): void {
    window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID, sessionId)
  }

  protected getTimeout(): number {
    const stored = window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_TIMEOUT)

    return stored !== null ? parseInt(stored) : new Date().getTime() - 1
  }

  protected setTimeout(timeout: number) {
    window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_TIMEOUT, timeout.toString())
  }
}
