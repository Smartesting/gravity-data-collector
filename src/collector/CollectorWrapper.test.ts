import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import ClickEventListener from '../event/listener/ClickEventListener'
import ChangeEventListener from '../event/listener/ChangeEventListener'
import { ConsoleEventHandler } from '../event/handler/ConsoleEventHandler'
import CollectorWrapper from './CollectorWrapper'
import { createSessionEvent } from '../event/event'

describe('CollectorWrapper', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
    vi.spyOn(ConsoleEventHandler.prototype, 'run').mockImplementation(() => {
      return {}
    })
  })

  describe('constructor', () => {
    function createCollectorWrapper() {
      // We are testing the side effects of the constructor, so we wrap
      // it here to avoid eslint error. We will not disable this rule which as great benefits, but not here.
      return new CollectorWrapper('abcd')
    }

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
  })
})
