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
      let clock: sinon.SinonFakeTimers

      beforeEach(() => {
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

    describe('generateNewSessionId', () => {
      it('generates a new session id', () => {
        assert.strictEqual(sessionIdHandler.get(), 'session-1')
        sessionIdHandler.generateNewSessionId()
        assert.strictEqual(sessionIdHandler.get(), 'session-2')
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
  () => new SessionStorageSessionIdHandler(incrementalIds, TIMEOUT, global.window),
  () => sessionStorage.clear(),
)

iSessionIdHandlerContractTest(
  'CookieSessionIdHandler',
  () => new CookieSessionIdHandler(incrementalIds, TIMEOUT, global.window),
  clearCookies,
)

function clearCookies() {
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
  })
}
