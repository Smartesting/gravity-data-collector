import ISessionIdHandler from './ISessionIdHandler'
import { beforeEach, describe, it } from 'vitest'
import assert from 'assert'
import MemorySessionIdHandler from './MemorySessionIdHandler'
import SessionStorageSessionIdHandler from './SessionStorageSessionIdHandler'
import CookieSessionIdHandler from './CookieSessionIdHandler'

let i = 0

function incrementalIds() {
  i += 1
  return `session-${i}`
}

function iSessionIdHandlerContractTest(
  implementationName: string,
  makeSessionIdHandler: () => ISessionIdHandler,
  cleanup: () => void,
) {
  describe(implementationName, () => {
    let sessionIdHandler: ISessionIdHandler
    beforeEach(() => {
      i = 0
      cleanup()
      sessionIdHandler = makeSessionIdHandler()
    })

    describe('isSet', () => {
      it('returns false when no session id has been generated', () => {
        assert.strictEqual(sessionIdHandler.isSet(), false)
      })

      it('returns true when a session id has been generated', () => {
        sessionIdHandler.get()
        assert.strictEqual(sessionIdHandler.isSet(), true)
      })
    })

    describe('get', () => {
      it('generates a new sessionId at the first call', () => {
        const sessionId = sessionIdHandler.get()
        assert.strictEqual(sessionId, 'session-1')
      })

      it('keeps the same session ID until a new sessionId is requested', () => {
        assert.strictEqual(sessionIdHandler.get(), 'session-1')
        assert.strictEqual(sessionIdHandler.get(), 'session-1')
        sessionIdHandler.generateNewSessionId()
        assert.strictEqual(sessionIdHandler.get(), 'session-2')
      })
    })
  })
}

iSessionIdHandlerContractTest(
  'MemorySessionIdHandler',
  () => new MemorySessionIdHandler(incrementalIds),
  () => {},
)

iSessionIdHandlerContractTest(
  'SessionStorageSessionIdHandler',
  () => new SessionStorageSessionIdHandler(incrementalIds, global.window),
  () => sessionStorage.clear(),
)

iSessionIdHandlerContractTest(
  'CookieSessionIdHandler',
  () => new CookieSessionIdHandler(incrementalIds, global.window),
  clearCookies,
)

function clearCookies() {
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
  })
}
