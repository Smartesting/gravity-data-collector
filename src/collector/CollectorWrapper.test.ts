import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event/listener/ClickEventListener'
import ChangeEventListener from '../event/listener/ChangeEventListener'
import CollectorWrapper from './CollectorWrapper'
import { createSessionStartedEvent } from '../event/createSessionStartedEvent'
import { CollectorOptions } from '../types'
import UnloadEventListener from '../event/listener/UnloadEventListener'
import EventHandler from '../event/handler/EventHandler'

describe('CollectorWrapper', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    vi.spyOn(EventHandler.prototype, 'run').mockImplementation(() => {

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
        // @ts-expect-error
        options = { debug: true }
      })

      it('a "sessionStarted" event is sent when initialized', () => {
        Date.parse('2022-05-12')
        vi.useFakeTimers()
        vi.setSystemTime(Date.parse('2022-05-12'))

        const expectedEvent = createSessionStartedEvent()

        const mock = vi.spyOn(EventHandler.prototype, 'run').mockImplementation(() => {
        })

        createCollectorWrapper()
        expect(mock).toHaveBeenCalledWith(expectedEvent)
      })

      it('initializes ClickEventListener', () => {
        vi.spyOn(ClickEventListener.prototype, 'init').mockImplementation(() => {
        })
        createCollectorWrapper()

        expect(ClickEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes ChangeEventListener', () => {
        vi.spyOn(ChangeEventListener.prototype, 'init').mockImplementation(() => {
        })
        createCollectorWrapper()

        expect(ChangeEventListener.prototype.init).toHaveBeenCalledOnce()
      })

      it('initializes UnloadEventListener', () => {
        vi.spyOn(UnloadEventListener.prototype, 'init').mockImplementation(() => {
        })
        createCollectorWrapper()

        expect(UnloadEventListener.prototype.init).toHaveBeenCalledOnce()
      })
    })
  })
})
