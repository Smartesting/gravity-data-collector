import ISessionIdHandler from './ISessionIdHandler'
import { beforeEach, describe, it } from 'vitest'
import assert from 'assert'
import MemorySessionIdHandler from './MemorySessionIdHandler'
import SessionStorageSessionIdHandler from './SessionStorageSessionIdHandler'
import CookieSessionIdHandler from './CookieSessionIdHandler'
import { nop } from '../utils/nop'
import { CookieStrategy } from '../types'
import { clearCookies } from '../test-utils/clearCookies'

let i = 0

function incrementalIds() {
  i += 1
  return `session-${i}`
}

describe.each([
  {
    implementation: 'CookieSessionIdHandler',
    makeSessionIdHandler: () =>
      new CookieSessionIdHandler(
        incrementalIds,
        { cookieWriter: null, cookieStrategy: CookieStrategy.default },
        global.window,
      ),
    cleanup: clearCookies,
  },
  {
    implementation: 'SessionStorageSessionIdHandler',
    makeSessionIdHandler: () => new SessionStorageSessionIdHandler(incrementalIds, global.window),
    cleanup: () => sessionStorage.clear(),
  },
  {
    implementation: 'MemorySessionIdHandler',
    makeSessionIdHandler: () => new MemorySessionIdHandler(incrementalIds),
    cleanup: nop,
  },
])('$implementation', ({ makeSessionIdHandler, cleanup }) => {
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
