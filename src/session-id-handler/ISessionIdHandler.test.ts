import ISessionIdHandler from './ISessionIdHandler'
import { afterEach, beforeEach, describe, it } from 'vitest'
import assert from 'assert'
import MemorySessionIdHandler from './MemorySessionIdHandler'
import SessionStorageSessionIdHandler from './SessionStorageSessionIdHandler'
import CookieSessionIdHandler from './CookieSessionIdHandler'
import sinon from 'sinon'

const TIMEOUT = 1000 * 60 * 30

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
      cleanup()
      sessionIdHandler = makeSessionIdHandler()
    })

    describe('isSet', () => {
      it('returns false when no session id has been set', () => {
        assert.strictEqual(sessionIdHandler.isSet(), false)
      })

      it('returns true when a session id has been set', () => {
        sessionIdHandler.set('abcd')
        assert.strictEqual(sessionIdHandler.isSet(), true)
      })
    })

    describe('get', () => {
      let clock: sinon.SinonFakeTimers

      beforeEach(() => {
        i = 0
        clock = sinon.useFakeTimers()
      })

      afterEach(() => {
        clock.restore()
      })

      it('generates a new sessionId when called', () => {
        const sessionId = sessionIdHandler.get()
        assert.strictEqual(sessionId, 'session-1')
      })

      it('keeps the same session ID until timeout is reached', () => {
        const sessionId = sessionIdHandler.get()
        clock.tick('10:00')
        const newSessionId = sessionIdHandler.get()

        assert.strictEqual(sessionId, 'session-1')
        assert.strictEqual(newSessionId, 'session-1')
      })

      it('generates a new ID once timeout is reached', () => {
        const sessionId = sessionIdHandler.get()
        clock.tick('31:00')
        const newSessionId = sessionIdHandler.get()

        assert.strictEqual(sessionId, 'session-1')
        assert.strictEqual(newSessionId, 'session-2')
      })
    })
  })
}

iSessionIdHandlerContractTest(
  'MemorySessionIdHandler',
  () => new MemorySessionIdHandler(incrementalIds, TIMEOUT),
  () => {},
)

iSessionIdHandlerContractTest(
  'SessionStorageSessionIdHandler',
  () => new SessionStorageSessionIdHandler(incrementalIds, TIMEOUT),
  () => sessionStorage.clear(),
)

iSessionIdHandlerContractTest(
  'CookieSessionIdHandler',
  () => new CookieSessionIdHandler(incrementalIds, TIMEOUT),
  clearCookies,
)

function clearCookies() {
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
  })
}
