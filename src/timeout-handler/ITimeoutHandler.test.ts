import ITimeoutHandler from './ITimeoutHandler'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import MemoryTimeoutHandler from './MemoryTimeoutHandler'
import CookieTimeoutHandler from './CookieTimeoutHandler'
import { nop } from '../utils/nop'

const SESSION_DURATION = 1234

describe.each([
  {
    implementation: 'MemoryTimeoutHandler',
    makeTimeoutHandler: () => new MemoryTimeoutHandler(SESSION_DURATION),
    cleanup: nop,
  },
  {
    implementation: 'CookieTimeoutHandler',
    makeTimeoutHandler: () => new CookieTimeoutHandler(SESSION_DURATION, global.window),
    cleanup: clearCookies,
  },
])('$implementation', ({ makeTimeoutHandler, cleanup }) => {
  let timeoutHandler: ITimeoutHandler
  beforeEach(() => {
    vitest.useFakeTimers()
    timeoutHandler = makeTimeoutHandler()
  })

  afterEach(() => {
    cleanup()
    vitest.useRealTimers()
  })

  describe('isExpired', () => {
    it('is false at initial state', () => {
      expect(timeoutHandler.isExpired()).toBe(false)
    })

    it('is true after sessionDuration', () => {
      vitest.advanceTimersByTime(SESSION_DURATION)
      expect(timeoutHandler.isExpired()).toBe(true)
    })
  })
})

function clearCookies() {
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
  })
}
