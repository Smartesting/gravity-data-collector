import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event-listeners/ClickEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import CollectorWrapper from './CollectorWrapper'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions } from '../types'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import UserActionHandler from '../user-action/UserActionHandler'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { nop } from '../utils/nop'
import TestNameHandler from '../test-name-handler/TestNameHandler'
import SessionStorageTestNameHandler from '../test-name-handler/SessionStorageTestNameHandler'
import completeOptions from '../utils/completeOptions'
import SessionTraitHandler from '../session-trait/SessionTraitHandler'
import { v4 as uuidv4 } from 'uuid'

describe('CollectorWrapper', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    mockWindowDocument()
    vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(nop)
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
        options = { debug: true }
      })

      it('a "sessionStarted" action is sent when initialized', () => {
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        const expectedAction = createSessionStartedUserAction()
        const mock = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(nop)

        createCollectorWrapper()
        expect(mock).toHaveBeenCalledWith(expectedAction)
      })

      it('does not send "sessionStarted" action if session id exists', () => {
        const sessionIdHandler = new MemorySessionIdHandler(uuidv4, 1000)
        const mock = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(nop)

        createCollectorWrapper(sessionIdHandler)
        expect(mock).toHaveBeenCalledOnce()
        const sessionId = sessionIdHandler.get()

        vi.clearAllMocks()
        createCollectorWrapper(sessionIdHandler)
        expect(mock).not.toHaveBeenCalled()
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
      const spyOnHandle = vi.spyOn(SessionTraitHandler.prototype, 'handle').mockImplementation(nop)
      collectorWrapper.identifySession('connected', { badFormat: true } as unknown as string)
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[Gravity Data Collector] The following session trait value is not allowed: ',
        { badFormat: true },
      )
      expect(spyOnHandle).not.toHaveBeenCalled()
    })
  })
})
