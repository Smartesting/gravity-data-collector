import ISessionIdHandler from './ISessionIdHandler'

const GRAVITY_SESSION_STORAGE_KEY_SESSION_ID = 'gravity-session-id'

export default class SessionStorageSessionIdHandler implements ISessionIdHandler {
  get(): string {
    const sessionId = window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID)
    if (sessionId !== null) return sessionId
    throw new Error('Set session id before using it')
  }

  isSet(): boolean {
    return window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID) !== null
  }

  set(sessionId: string): void {
    window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID, sessionId)
  }
}
