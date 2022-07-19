import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event/listener/ClickEventListener'
import ChangeEventListener from '../event/listener/ChangeEventListener'
import { ConsoleEventHandler } from '../event/handler/ConsoleEventHandler'
import CollectorWrapper from './CollectorWrapper'
import { createSessionEvent } from '../event/createSessionEvent'
import { CollectorOptions } from '../types'
import UnloadEventListener from '../event/listener/UnloadEventListener'
import { GravityEventHandler } from '../event/handler/GravityEventHandler'

describe('CollectorWrapper', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    vi.spyOn(ConsoleEventHandler.prototype, 'run').mockImplementation(() => {
      return {}
    })
  })

  describe('constructor', () => {
    let options: CollectorOptions

    function createCollectorWrapper() {
      // We are testing the side effects of the constructor, so we wrap
      // it here to avoid eslint error. We will not disable this rule which as great benefits, but not here.
      return new CollectorWrapper(options, global.window)
    }

    describe('when debug option is set to true', () => {
      beforeEach(() => {
        options = { debug: true }
      })

      it('instantiates a ConsoleEventHandler by default', () => {
        const sut = createCollectorWrapper()
        expect(sut.eventHandler).toBeInstanceOf(ConsoleEventHandler)
      })

      it('a "sessionStarted" event is sent when initialized', () => {
        Date.parse('2022-05-12')
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        const expectedEvent = createSessionEvent()

        const mock = vi.spyOn(ConsoleEventHandler.prototype, 'run').mockImplementation(() => {
          return {}
        })

        createCollectorWrapper()
        expect(mock).toHaveBeenCalledWith(expectedEvent)
      })

      it('initializes ClickEventListener', () => {
        vi.spyOn(ClickEventListener.prototype, 'init').mockImplementation(() => {
          return {}
        })
        createCollectorWrapper()

        expect(ClickEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes ChangeEventListener', () => {
        vi.spyOn(ChangeEventListener.prototype, 'init').mockImplementation(() => {
          return {}
        })
        createCollectorWrapper()

        expect(ChangeEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes UnloadEventListener', () => {
        vi.spyOn(UnloadEventListener.prototype, 'init').mockImplementation(() => {
          return {}
        })
        createCollectorWrapper()

        expect(UnloadEventListener.prototype.init).toHaveBeenCalledOnce()
      })
    })

    describe('when debug option is set to false (default version)', () => {
      beforeEach(() => {
        options = { debug: false }
      })

      it('throws an error if AuthKey is not set', () => {
        expect(() => createCollectorWrapper()).toThrowError('No AuthKey was specified')
      })

      describe('when AuthKey is specified', () => {
        beforeEach(() => {
          options = {
            debug: false,
            authKey: '123-456-789',
          }
        })

        it('instantiates a GravityEventHandler', () => {
          const sut = createCollectorWrapper()
          expect(sut.eventHandler).toBeInstanceOf(GravityEventHandler)
        })
      })
    })
  })
})
