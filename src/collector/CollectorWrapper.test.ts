import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event-listeners/ClickEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import CollectorWrapper from './CollectorWrapper'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions } from '../types'
import MemoryUserActionHandler from '../user-action/handler/MemoryUserActionHandler'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import SessionIdHandler from '../session-id-handler/SessionIdHandler'
import { nop } from '../utils/nop'
import SessionStorageUserActionHandler from '../user-action/handler/SessionStorageUserActionHandler'

describe('CollectorWrapper', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    mockWindowDocument()
    vi.spyOn(MemoryUserActionHandler.prototype, 'handle').mockImplementation(nop)
  })

  describe('constructor', () => {
    let options: CollectorOptions

    function createCollectorWrapper(sessionIdHandler: SessionIdHandler = new MemorySessionIdHandler()) {
      // We are testing the side effects of the constructor, so we wrap
      // it here to avoid eslint error. We will not disable this rule which as great benefits, but not here.
      return new CollectorWrapper(options, global.window, sessionIdHandler)
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
        const mock = vi.spyOn(SessionStorageUserActionHandler.prototype, 'handle').mockImplementation(nop)

        createCollectorWrapper()
        expect(mock).toHaveBeenCalledWith(expectedAction)
      })

      it('does not send "sessionStarted" action if session id exists', () => {
        const sessionIdHandler = new MemorySessionIdHandler()
        const mock = vi.spyOn(SessionStorageUserActionHandler.prototype, 'handle').mockImplementation(nop)

        createCollectorWrapper(sessionIdHandler)
        expect(mock).toHaveBeenCalledOnce()
        const sessionId = sessionIdHandler.get()

        vi.clearAllMocks()
        createCollectorWrapper(sessionIdHandler)
        expect(mock).not.toHaveBeenCalled()
        expect(sessionIdHandler.get()).toEqual(sessionId)
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
})
