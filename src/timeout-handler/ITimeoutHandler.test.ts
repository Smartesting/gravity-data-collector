import ITimeoutHandler from './ITimeoutHandler'
import { afterEach, beforeEach, describe, expect, it, vitest } from 'vitest'
import MemoryTimeoutHandler from './MemoryTimeoutHandler'
import CookieTimeoutHandler from './CookieTimeoutHandler'

const SESSION_DURATION = 1234

function contractTest(implementationName: string, makeTimeoutHandler: () => ITimeoutHandler, cleanup: () => void) {
  describe(implementationName, () => {
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

      it('automatically reset timeout after sessionDuration', () => {
        vitest.advanceTimersByTime(SESSION_DURATION)
        expect(timeoutHandler.isExpired()).toBe(true)
        vitest.advanceTimersByTime(1)
        expect(timeoutHandler.isExpired()).toBe(false)
        vitest.advanceTimersByTime(SESSION_DURATION)
        expect(timeoutHandler.isExpired()).toBe(true)
      })
    })
  })
}

contractTest(
  'MemoryTimeoutHandler',
  () => new MemoryTimeoutHandler(SESSION_DURATION),
  () => {},
)

contractTest('CookieTimeoutHandler', () => new CookieTimeoutHandler(SESSION_DURATION, global.window), clearCookies)

function clearCookies() {
  document.cookie.split(';').forEach(function (c) {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
  })
}
