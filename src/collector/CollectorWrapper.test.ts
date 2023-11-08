import { afterEach, beforeEach, describe, expect, it, SpyInstance, vi } from 'vitest'
import { mockFetch, mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event-listeners/ClickEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import CollectorWrapper from './CollectorWrapper'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions, Listener, SessionTraitValue, UserAction } from '../types'
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
import createAsyncRequest from '../user-action/createAsyncRequest'
import CypressEventListener from '../event-listeners/CypressEventListener'
import HttpGravityClient from '../gravity-client/HttpGravityClient'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import waitForExpect from 'wait-for-expect'

describe.skip('CollectorWrapper', () => {
  const DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS = {
    debug: true,
    window: global.window,
  }
  let spyOnUserActionHandle: SpyInstance<[UserAction], void>
  let spyOnTraitHandle: SpyInstance<[string, SessionTraitValue], void>
  let spyOnEventListenersHandlerInitialize: SpyInstance<[], void>
  let spyOnScreenRecorderHandlerInitialize: SpyInstance<[], void>

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    mockWindowDocument()
    spyOnUserActionHandle = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(nop)
    spyOnTraitHandle = vi.spyOn(SessionTraitHandler.prototype, 'handle').mockImplementation(nop)
    spyOnEventListenersHandlerInitialize = vi
      .spyOn(EventListenersHandler.prototype, 'initializeEventListeners')
      .mockImplementation(nop)
    spyOnScreenRecorderHandlerInitialize = vi
      .spyOn(ScreenRecorderHandler.prototype, 'initializeRecording')
      .mockImplementation(nop)
    global.fetch = vi.fn()
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
      return new CollectorWrapper(
        { ...options, ...DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS },
        sessionIdHandler,
        testNameHandler,
        mockFetch(),
      )
    }

    describe('when debug option is set to true', () => {
      beforeEach(() => {
        // @ts-expect-error
        options = {
          sessionsPercentageKept: 100,
          rejectSession: DEFAULT_SESSION_REJECTION,
        }
      })

      it('a "sessionStarted" action is sent when initialized', async () => {
        const expectedAction = createSessionStartedUserAction()

        createCollectorWrapper()

        await waitExpectation(() => expect(spyOnUserActionHandle).toHaveBeenCalledWith(expectedAction))
      })

      it('does not send "sessionStarted" action if session id exists', async () => {
        const sessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)

        createCollectorWrapper(sessionIdHandler)
        await waitExpectation(() => expect(spyOnUserActionHandle).toHaveBeenCalledOnce())

        const sessionId = sessionIdHandler.get()
        createCollectorWrapper(sessionIdHandler)
        await waitExpectation(() => {
          expect(spyOnUserActionHandle).not.toHaveBeenCalled()
          expect(sessionIdHandler.get()).toEqual(sessionId)
        })
      })

      it('a "sessionStarted" action is sent if session id exists but this is a new test', async () => {
        const sessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)
        const mock = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(nop)

        createCollectorWrapper(sessionIdHandler)

        const testNameHandler = new SessionStorageTestNameHandler()
        vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(() => {
          return 'test'
        })

        createCollectorWrapper(sessionIdHandler, testNameHandler)

        await waitExpectation(() => expect(mock).toHaveBeenCalledOnce())
      })

      describe('event listener initializing', () => {
        interface ListenerTestData {
          listenerClassName: string
          listenerClass: any
          listenerOption: Listener
        }

        const listeners: ListenerTestData[] = [
          {
            listenerClassName: 'ClickEventListener',
            listenerClass: ClickEventListener,
            listenerOption: Listener.Click,
          },
          {
            listenerClassName: 'KeyUpEventListener',
            listenerClass: KeyUpEventListener,
            listenerOption: Listener.KeyUp,
          },
          {
            listenerClassName: 'KeyDownEventListener',
            listenerClass: KeyDownEventListener,
            listenerOption: Listener.KeyDown,
          },
          {
            listenerClassName: 'ChangeEventListener',
            listenerClass: ChangeEventListener,
            listenerOption: Listener.Change,
          },
          {
            listenerClassName: 'BeforeUnloadEventListener',
            listenerClass: BeforeUnloadEventListener,
            listenerOption: Listener.BeforeUnload,
          },
        ]

        for (const { listenerClassName, listenerClass, listenerOption } of listeners) {
          describe(`${listenerClassName}`, () => {
            describe('when options.enabledListeners is not specified', () => {
              it(`initializes ${listenerClassName}`, async () => {
                vi.spyOn(listenerClass.prototype, 'init').mockImplementation(nop)
                createCollectorWrapper()

                await waitExpectation(() => expect(listenerClass.prototype.init).toHaveBeenCalledOnce())
              })
            })

            describe('when options.enabledListeners is specified', () => {
              it(`does not initialize ${listenerClassName} when ${listenerOption} is not present`, async () => {
                options.enabledListeners = []
                vi.spyOn(listenerClass.prototype, 'init').mockImplementation(nop)
                createCollectorWrapper()

                await waitExpectation(() => expect(listenerClass.prototype.init).not.toHaveBeenCalled())
              })

              it(`initializes ${listenerClassName} when ${listenerOption} is present`, async () => {
                options.enabledListeners = [listenerOption]
                vi.spyOn(listenerClass.prototype, 'init').mockImplementation(nop)
                createCollectorWrapper()

                await waitExpectation(() => expect(listenerClass.prototype.init).toHaveBeenCalledOnce())
              })
            })
          })
        }
      })

      describe('initializes CypressEventListener', () => {
        afterEach(() => {
          delete (window as any).Cypress
        })

        it('unless window.Cypress is not available', async () => {
          vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
          createCollectorWrapper()
          await waitExpectation(() => expect(CypressEventListener.prototype.init).not.toHaveBeenCalledOnce())
        })

        describe('window.Cypress is available', () => {
          it('initializes if enabledListeners option is not set ', async () => {
            vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
            ;(window as any).Cypress = {}
            createCollectorWrapper()
            await waitExpectation(() => expect(CypressEventListener.prototype.init).toHaveBeenCalledOnce())
          })

          it('does not initialize if enabledListeners option is set but does not include CypressCommands', async () => {
            vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
            ;(window as any).Cypress = {}
            options.enabledListeners = []
            createCollectorWrapper()
            await waitExpectation(() => expect(CypressEventListener.prototype.init).not.toHaveBeenCalled())
          })

          it('does not initialize if enabledListeners option is set and includes CypressCommands', async () => {
            vi.spyOn(CypressEventListener.prototype, 'init').mockImplementation(nop)
            ;(window as any).Cypress = {}
            options.enabledListeners = [Listener.CypressCommands]
            createCollectorWrapper()
            await waitExpectation(() => expect(CypressEventListener.prototype.init).toHaveBeenCalledOnce())
          })
        })
      })
    })

    describe('activate/deactivate session/video tracking', () => {
      describe('when fetched session recording setting is false', () => {
        beforeEach(() => {
          vi.spyOn(HttpGravityClient.prototype, 'readSessionCollectionSettings').mockReturnValue(
            Promise.resolve({
              settings: {
                sessionRecording: false,
                videoRecording: false,
              },
              error: null,
            }),
          )
        })

        it('does not record user actions neither video events', async () => {
          // eslint-disable-next-line no-new
          new CollectorWrapper(
            completeOptions({
              authKey: uuidv4(),
              window: global.window,
            }),
            new MemorySessionIdHandler(uuidv4, 1000),
            new SessionStorageTestNameHandler(),
          )

          await waitExpectation(() => {
            expect(spyOnEventListenersHandlerInitialize).not.toHaveBeenCalled()
            expect(spyOnScreenRecorderHandlerInitialize).not.toHaveBeenCalled()
          })
        })
      })

      describe('when fetched session recording setting is true', () => {
        beforeEach(() => {
          vi.spyOn(HttpGravityClient.prototype, 'readSessionCollectionSettings').mockReturnValue(
            Promise.resolve({
              settings: {
                sessionRecording: true,
                videoRecording: false,
              },
              error: null,
            }),
          )
        })

        it('records user actions and no video event', async () => {
          // eslint-disable-next-line no-new
          new CollectorWrapper(
            completeOptions({
              authKey: uuidv4(),
              window: global.window,
            }),
            new MemorySessionIdHandler(uuidv4, 1000),
            new SessionStorageTestNameHandler(),
          )

          await waitExpectation(() => {
            expect(spyOnEventListenersHandlerInitialize).toHaveBeenCalled()
            expect(spyOnScreenRecorderHandlerInitialize).not.toHaveBeenCalled()
          })
        })
      })

      describe('when fetched video recording setting is true', () => {
        beforeEach(() => {
          vi.spyOn(HttpGravityClient.prototype, 'readSessionCollectionSettings').mockReturnValue(
            Promise.resolve({
              settings: {
                sessionRecording: true,
                videoRecording: true,
              },
              error: null,
            }),
          )
        })

        it('records user actions and video events', async () => {
          // eslint-disable-next-line no-new
          new CollectorWrapper(
            completeOptions({
              authKey: uuidv4(),
              window: global.window,
            }),
            new MemorySessionIdHandler(uuidv4, 1000),
            new SessionStorageTestNameHandler(),
          )

          await waitExpectation(() => {
            expect(spyOnEventListenersHandlerInitialize).toHaveBeenCalled()
            expect(spyOnScreenRecorderHandlerInitialize).toHaveBeenCalled()
          })
        })
      })

      describe('when fetched video recording setting is false', () => {
        beforeEach(() => {
          vi.spyOn(HttpGravityClient.prototype, 'readSessionCollectionSettings').mockReturnValue(
            Promise.resolve({
              settings: {
                sessionRecording: true,
                videoRecording: false,
              },
              error: null,
            }),
          )
        })

        it('records user actions and no video event', async () => {
          // eslint-disable-next-line no-new
          new CollectorWrapper(
            completeOptions({
              authKey: uuidv4(),
              window: global.window,
            }),
            new MemorySessionIdHandler(uuidv4, 1000),
            new SessionStorageTestNameHandler(),
          )

          await waitExpectation(() => {
            expect(spyOnEventListenersHandlerInitialize).toHaveBeenCalled()
            expect(spyOnScreenRecorderHandlerInitialize).not.toHaveBeenCalled()
          })
        })
      })
    })

    describe('when recordRequestsFor is not set and originsToRecord is set', () => {
      beforeEach(() => {
        // @ts-expect-error
        options = {
          sessionsPercentageKept: 100,
          rejectSession: DEFAULT_SESSION_REJECTION,
          originsToRecord: ['https://server.com'],
        }
      })

      it('records the request when a fetch is made with a URL origin that can be recorded', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        createCollectorWrapper()
        await fetch('https://server.com/example', {
          method: 'GET',
        })

        expect(spyOnUserActionHandle).toHaveBeenCalledWith(createAsyncRequest('https://server.com/example', 'GET'))

        await fetch('https://notrecorded.com/example', {
          method: 'GET',
        })

        expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
          createAsyncRequest('https://notrecorded.com/example', 'GET'),
        )
      })

      it('records the request when a XHR is made with a URL origin that can be recorded', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        createCollectorWrapper()
        const xhr = new XMLHttpRequest()
        xhr.open('GET', 'https://server.com/example')

        expect(spyOnUserActionHandle).toHaveBeenCalledWith(createAsyncRequest('https://server.com/example', 'GET'))

        xhr.open('GET', 'https://notrecorded.com/example')

        expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
          createAsyncRequest('https://notrecorded.com/example', 'GET'),
        )
      })
    })

    describe('when recordRequestsFor is set', () => {
      beforeEach(() => {
        // @ts-expect-error
        options = {
          gravityServerUrl: 'https://gravity-server.com',
          recordRequestsFor: ['https://server.com', 'https://gravity-server.com'],
          sessionsPercentageKept: 100,
          rejectSession: DEFAULT_SESSION_REJECTION,
        }
      })

      describe('and originsToRecord is set', () => {
        beforeEach(() => {
          options.originsToRecord = ['https://deprecated.com']
        })

        it('uses recordRequestsFor option rather than originsToRecord option to determine if the request should be recorded when a fetch is made', async () => {
          vi.useFakeTimers()
          vi.setSystemTime(Date.parse('2022-05-12'))

          createCollectorWrapper()
          await fetch('https://deprecated.com/example', {
            method: 'GET',
          })

          expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
            createAsyncRequest('https://deprecated.com/example', 'GET'),
          )

          await fetch('https://server.com/example', {
            method: 'GET',
          })

          expect(spyOnUserActionHandle).toHaveBeenCalledWith(createAsyncRequest('https://server.com/example', 'GET'))
        })

        it('uses recordRequestsFor option rather than originsToRecord option to determine if the request should be recorded when a XHR is made', async () => {
          vi.useFakeTimers()
          vi.setSystemTime(Date.parse('2022-05-12'))

          createCollectorWrapper()
          const xhr = new XMLHttpRequest()
          xhr.open('GET', 'https://deprecated.com/example')

          expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
            createAsyncRequest('https://deprecated.com/example', 'GET'),
          )

          xhr.open('GET', 'https://server.com/example')

          expect(spyOnUserActionHandle).toHaveBeenCalledWith(createAsyncRequest('https://server.com/example', 'GET'))
        })
      })

      it('records the request when a fetch is made with a URL origin that can be recorded', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        createCollectorWrapper()
        await fetch('https://server.com/example', {
          method: 'GET',
        })

        expect(spyOnUserActionHandle).toHaveBeenCalledWith(createAsyncRequest('https://server.com/example', 'GET'))

        await fetch('https://notrecorded.com/example', {
          method: 'GET',
        })

        expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
          createAsyncRequest('https://notrecorded.com/example', 'GET'),
        )
      })

      it('records the request when a XHR is made with a URL origin that can be recorded', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        createCollectorWrapper()
        const xhr = new XMLHttpRequest()
        xhr.open('GET', 'https://server.com/example')

        expect(spyOnUserActionHandle).toHaveBeenCalledWith(createAsyncRequest('https://server.com/example', 'GET'))

        xhr.open('GET', 'https://notrecorded.com/example')

        expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
          createAsyncRequest('https://notrecorded.com/example', 'GET'),
        )
      })

      it('does not record a tracking request from Gravity when a fetch is made', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        createCollectorWrapper()
        await fetch('https://gravity-server.com/api/tracking/abcd-efg/publish', {
          method: 'POST',
        })

        expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
          createAsyncRequest('https://gravity-server.com/api/tracking/abcd-efg/publish', 'POST'),
        )
      })

      it('does not record a tracking request from Gravity when a XHR is made', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        createCollectorWrapper()
        const xhr = new XMLHttpRequest()
        xhr.open('POST', 'https://gravity-server.com/api/tracking/abcd-efg/publish')

        expect(spyOnUserActionHandle).not.toHaveBeenCalledWith(
          createAsyncRequest('https://gravity-server.com/api/tracking/abcd-efg/publish', 'POST'),
        )
      })
    })
  })

  describe('identifySession', () => {
    it('delegates session trait to handler', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions(DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS),
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )
      const mock = vi.spyOn(SessionTraitHandler.prototype, 'handle').mockImplementation(nop)
      collectorWrapper.identifySession('connected', true)
      expect(mock).toHaveBeenCalledWith('connected', true)
    })

    it('prevents bad format of session trait value', () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions(DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS),
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
    it('should always track if percentage is 100', async () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          ...DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS,
          sessionsPercentageKept: 100,
        }),
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )

      await waitExpectation(() => {
        expect(spyOnUserActionHandle).toHaveBeenCalledOnce()
        collectorWrapper.identifySession('logged', true)
        expect(spyOnTraitHandle).toHaveBeenCalledOnce()
      })
    })

    it('should never track if percentage is 0', async () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          ...DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS,
          sessionsPercentageKept: 0,
        }),
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )

      await waitExpectation(() => {
        expect(spyOnUserActionHandle).not.toHaveBeenCalled()
        collectorWrapper.identifySession('logged', true)
        expect(spyOnTraitHandle).not.toHaveBeenCalled()
      })
    })

    it('should continue tracking if collector is reset while the same session', async () => {
      const memorySessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)

      function createCollector(sessionsPercentageKept: number) {
        return new CollectorWrapper(
          completeOptions({
            ...DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS,
            sessionsPercentageKept,
          }),
          memorySessionIdHandler,
          new SessionStorageTestNameHandler(),
        )
      }

      createCollector(100)
      await waitExpectation(() => {
        expect(spyOnUserActionHandle).toHaveBeenCalledOnce()
        expect(spyOnTraitHandle).not.toHaveBeenCalled()
      })

      const collectorWrapper = createCollector(0) // act as a new random choice causing tracker disabling
      await waitExpectation(() => {
        expect(spyOnUserActionHandle).toHaveBeenCalledOnce()
        expect(spyOnTraitHandle).not.toHaveBeenCalled()

        collectorWrapper.identifySession('logged', true)
        expect(spyOnTraitHandle).toHaveBeenCalledOnce()
      })
    })

    // flaky test ??
    it('should collect percentage/100 from N sessions (if N is large enough...) ', async () => {
      const sessionsPercentageKept = 10

      async function createCollector() {
        const collectorWrapper = new CollectorWrapper(
          completeOptions({
            ...DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS,
            sessionsPercentageKept,
          }),
          new MemorySessionIdHandler(uuidv4, 1000),
          new SessionStorageTestNameHandler(),
        )
        setTimeout(() => {
          return collectorWrapper
        }, 10)
      }

      function isApproximation(candidate: number, target: number, tolerance: number) {
        return candidate >= target - tolerance && candidate <= target + tolerance
      }

      const max = 1000
      let countCollectedSessions: number = 0
      for (let i = 1; i <= max; i++) {
        await createCollector()
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
    it('should not track session if rejectSession is positive', async () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          ...DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS,
          rejectSession: () => true,
        }),
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )

      await waitExpectation(() => {
        expect(spyOnUserActionHandle).not.toHaveBeenCalled()
        collectorWrapper.identifySession('logged', true)
        expect(spyOnTraitHandle).not.toHaveBeenCalled()
      })
    })

    it('should keep session tracking if rejectSession is negative', async () => {
      const collectorWrapper = new CollectorWrapper(
        completeOptions({
          ...DEFAULT_TEST_COLLECTOR_WRAPPER_OPTIONS,
          rejectSession: () => false,
        }),
        new MemorySessionIdHandler(uuidv4, 1000),
        new SessionStorageTestNameHandler(),
      )

      await waitExpectation(() => {
        expect(spyOnUserActionHandle).toHaveBeenCalled()
        collectorWrapper.identifySession('logged', true)
        expect(spyOnTraitHandle).toHaveBeenCalled()
      })
    })
  })
})

async function waitExpectation(expectation: () => void) {
  await waitForExpect(expectation)
}
