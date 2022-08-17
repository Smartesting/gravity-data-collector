import SessionIdHandler from './SessionIdHandler'

const GRAVITY_SESSION_STORAGE_KEY_SESSION_ID = 'gravity-session-id'

export default class SessionStorageSessionIdHandler implements SessionIdHandler {
  get(): string {
    const sessionId = window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID)
    console.error('GET SESSION ID', sessionId)
    if (sessionId !== null) return sessionId
    throw new Error('Set session id before to use it')
  }

  isSet(): boolean {
    return window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID) !== null
  }

  set(sessionId: string): void {
    console.error('SET SESSION ID', sessionId)
    window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID, sessionId)
  }
}
