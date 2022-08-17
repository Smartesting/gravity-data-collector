import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowDocument, mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event-listeners/ClickEventListener'
import ChangeEventListener from '../event-listeners/ChangeEventListener'
import CollectorWrapper from './CollectorWrapper'
import { createSessionStartedUserAction } from '../user-action/createSessionStartedUserAction'
import { CollectorOptions } from '../types'
import UnloadEventListener from '../event-listeners/UnloadEventListener'
import UserActionHandler from '../user-action/UserActionHandler'
import KeyUpEventListener from '../event-listeners/KeyUpEventListener'
import KeyDownEventListener from '../event-listeners/KeyDownEventListener'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'

describe('CollectorWrapper', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    mockWindowDocument()
    vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(() => {})
  })

  describe('constructor', () => {
    let options: CollectorOptions

    function createCollectorWrapper() {
      // We are testing the side effects of the constructor, so we wrap
      // it here to avoid eslint error. We will not disable this rule which as great benefits, but not here.
      return new CollectorWrapper(options, global.window, new MemorySessionIdHandler())
    }

    describe('when debug option is set to true', () => {
      beforeEach(() => {
        // @ts-expect-error
        options = { debug: true }
      })

      it('a "sessionStarted" action is sent when initialized', () => {
        Date.parse('2022-05-12')
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        const expectedAction = createSessionStartedUserAction()

        const mock = vi.spyOn(UserActionHandler.prototype, 'handle').mockImplementation(() => {})

        createCollectorWrapper()
        expect(mock).toHaveBeenCalledWith(expectedAction)
      })

      it('initializes ClickEventListener', () => {
        vi.spyOn(ClickEventListener.prototype, 'init').mockImplementation(() => {})
        createCollectorWrapper()

        expect(ClickEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes ChangeEventListener', () => {
        vi.spyOn(ChangeEventListener.prototype, 'init').mockImplementation(() => {})
        createCollectorWrapper()

        expect(ChangeEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes UnloadEventListener', () => {
        vi.spyOn(UnloadEventListener.prototype, 'init').mockImplementation(() => {})
        createCollectorWrapper()

        expect(UnloadEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes KeyUpEventListener', () => {
        vi.spyOn(KeyUpEventListener.prototype, 'init').mockImplementation(() => {})
        createCollectorWrapper()

        expect(KeyUpEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes KeyDownEventListener', () => {
        vi.spyOn(KeyDownEventListener.prototype, 'init').mockImplementation(() => {})
        createCollectorWrapper()

        expect(KeyDownEventListener.prototype.init).toHaveBeenCalledOnce()
      })
    })
  })
})
