import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event-listeners/ClickEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import CollectorWrapper from './CollectorWrapper'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions, SessionTraitValue, UserAction } from '../types'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import UserActionHandler from '../user-action/UserActionHandler'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { nop } from '../utils/nop'
import TestNameHandler from '../test-name-handler/TestNameHandler'
import SessionStorageTestNameHandler from '../test-name-handler/SessionStorageTestNameHandler'
import completeOptions, { DEFAULT_SESSION_REJECTION } from '../utils/completeOptions'
import SessionTraitHandler from '../session-trait/SessionTraitHandler'
import { v4 as uuidv4 } from 'uuid'
import { AssertionError } from 'assert'

global.fetch = vi.fn()

describe('CollectorWrapper', () => {
  let spyOnUserActionHandle: SpyInstance<[UserAction], void>
  let spyOnTraitHandle: SpyInstance<[string, SessionTraitValue], void>

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    mockWindowDocument()
    spyOnUserActionHandle = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(nop)
    spyOnTraitHandle = vi.spyOn(SessionTraitHandler.prototype, 'handle').mockImplementation(nop)
  })

  afterEach(() => {
    spyOnUserActionHandle.mockReset()
    spyOnTraitHandle.mockReset()
  })

  describe('constructor', () => {
    let options: CollectorOptions

    function createCollectorWrapper(
      sessionIdHandler: ISessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000),
      testNameHandler: TestNameHandler = new SessionStorageTestNameHandler(),
    ) {
      // We are testing the side effects of the constructor, so we wrap
      // it here to avoid eslint error. We will not disable this rule which as great benefits, but not here.
      return new CollectorWrapper(options, global.window, sessionIdHandler, testNameHandler)
    }

    describe('when debug option is set to true', () => {
      beforeEach(() => {
        // @ts-expect-error
        options = {
          debug: true,
          sessionsPercentageKept: 100,
          rejectSession: DEFAULT_SESSION_REJECTION,
        }
      })

      it('a "sessionStarted" action is sent when initialized', () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        const expectedAction = createSessionStartedUserAction()

        createCollectorWrapper()
        expect(spyOnUserActionHandle).toHaveBeenCalledWith(expectedAction)
      })

      it('does not send "sessionStarted" action if session id exists', () => {
        const sessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)

        createCollectorWrapper(sessionIdHandler)
        expect(spyOnUserActionHandle).toHaveBeenCalledOnce()
        const sessionId = sessionIdHandler.get()

        vi.clearAllMocks()
        createCollectorWrapper(sessionIdHandler)
        expect(spyOnUserActionHandle).not.toHaveBeenCalled()
        expect(sessionIdHandler.get()).toEqual(sessionId)
      })

      it('a "sessionStarted" action is sent if session id exists but this is a new test', () => {
        const sessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)
        const mock = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(nop)

        createCollectorWrapper(sessionIdHandler)

        const testNameHandler = new SessionStorageTestNameHandler()
        vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(() => {
          return 'test'
        })

        createCollectorWrapper(sessionIdHandler, testNameHandler)
        expect(mock).toHaveBeenCalledOnce()
      })

      it('initializes ClickEventListener', () => {
        vi.spyOn(ClickEventListener.prototype, 'init').mockImplementation(nop)
        createCollectorWrapper()

        expect(ClickEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes ChangeEventListener', () => {
        vi.spyOn(ChangeEventListener.prototype, 'init').mockImplementation(nop)
        createCollectorWrapper()

        expect(ChangeEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes BeforeUnloadEventListener', () => {
        vi.spyOn(BeforeUnloadEventListener.prototype, 'init').mockImplementation(nop)
        createCollectorWrapper()

        expect(BeforeUnloadEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes KeyUpEventListener', () => {
        vi.spyOn(KeyUpEventListener.prototype, 'init').mockImplementation(nop)
        createCollectorWrapper()

        expect(KeyUpEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes KeyDownEventListener', () => {
        vi.spyOn(KeyDownEventListener.prototype, 'init').mockImplementation(nop)
        createCollectorWrapper()

        expect(KeyDownEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('handles the request when a fetch is made', async () => {
        createCollectorWrapper()
        await fetch('https://server.com/example', {
          method: 'GET',
        })

        expect(spyOnUserActionHandle).toHaveBeenCalledWith({
          pathname: 'https://server.com/example',
          method: 'GET',
        })
      })
    })
  })

  describe('identifySession', () => {
    it('delegates session trait to handler', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({ debug: true }),
        global.window,
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )
      const mock = vi.spyOn(SessionTraitHandler.prototype, 'handle').mockImplementation(nop)
      collectorWrapper.identifySession('connected', true)
      expect(mock).toHaveBeenCalledWith('connected', true)
    })

    it('prevents bad format of session trait value', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({ debug: true }),
        global.window,
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )
      const mockConsoleWarn = vi.spyOn(global.console, 'warn').mockImplementation(nop)
      collectorWrapper.identifySession('connected', { badFormat: true } as unknown as string)
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Gravity Data Collector] The following session trait value is not allowed: ',
        { badFormat: true },
      )
      expect(spyOnTraitHandle).not.toHaveBeenCalled()
    })
  })

  describe('tracking is active for the current session according option "sessionsPercentageKept"', () => {
    it('should always track if percentage is 100', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          debug: true,
          sessionsPercentageKept: 100,
        }),
        global.window,
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )
      expect(spyOnUserActionHandle).toHaveBeenCalledOnce()
      collectorWrapper.identifySession('logged', true)
      expect(spyOnTraitHandle).toHaveBeenCalledOnce()
    })

    it('should never track if percentage is 0', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          debug: true,
          sessionsPercentageKept: 0,
        }),
        global.window,
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )
      expect(spyOnUserActionHandle).not.toHaveBeenCalled()
      collectorWrapper.identifySession('logged', true)
      expect(spyOnTraitHandle).not.toHaveBeenCalled()
    })

    it('should continue tracking if collector is reset while the same session', () => {
      const memorySessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)

      function createCollector(sessionsPercentageKept: number) {
        return new CollectorWrapper(
          completeOptions({
            debug: true,
            sessionsPercentageKept,
          }),
          global.window,
          memorySessionIdHandler,
          new SessionStorageTestNameHandler(),
        )
      }

      createCollector(100)
      expect(spyOnUserActionHandle).toHaveBeenCalledOnce()
      expect(spyOnTraitHandle).not.toHaveBeenCalled()

      const collectorWrapper = createCollector(0) // act as a new random choice causing tracker disabling
      expect(spyOnUserActionHandle).toHaveBeenCalledOnce()
      expect(spyOnTraitHandle).not.toHaveBeenCalled()

      collectorWrapper.identifySession('logged', true)
      expect(spyOnTraitHandle).toHaveBeenCalledOnce()
    })

    // flaky test ??
    it('should collect percentage/100 from N sessions (if N is large enough...) ', () => {
      const sessionsPercentageKept = 10

      function createCollector() {
        return new CollectorWrapper(
          completeOptions({
            debug: true,
            sessionsPercentageKept,
          }),
          global.window,
          new MemorySessionIdHandler(uuidv4, 1000),
          new SessionStorageTestNameHandler(),
        )
      }

      function isApproximation(candidate: number, target: number, tolerance: number) {
        return candidate >= target - tolerance && candidate <= target + tolerance
      }

      const max = 1000
      let countCollectedSessions: number = 0
      for (let i = 1; i <= max; i++) {
        createCollector()
        countCollectedSessions = spyOnUserActionHandle.mock.calls.length
        const percentage = (100 * countCollectedSessions) / i
        if (i >= 100) {
          // console.log(countCollectedSessions, i, percentage)
          if (isApproximation(percentage, sessionsPercentageKept, 2)) return
        }
      }
      throw new AssertionError({
        message: `Expected ${sessionsPercentageKept}% sessions to be kept but get ${
          (100 * countCollectedSessions) / max
        }%`,
      })
    })
  })

  describe('option "rejectSession" allows to reject a session', () => {
    it('should not track session if rejectSession is positive', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          debug: true,
          rejectSession: () => true,
        }),
        global.window,
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )
      expect(spyOnUserActionHandle).not.toHaveBeenCalled()
      collectorWrapper.identifySession('logged', true)
      expect(spyOnTraitHandle).not.toHaveBeenCalled()
    })

    it('should keep session tracking if rejectSession is negative', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          debug: true,
          rejectSession: () => false,
        }),
        global.window,
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )
      expect(spyOnUserActionHandle).toHaveBeenCalled()
      collectorWrapper.identifySession('logged', true)
      expect(spyOnTraitHandle).toHaveBeenCalled()
    })
  })
})
