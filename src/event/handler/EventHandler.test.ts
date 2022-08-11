import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import EventHandler from '../../event/handler/EventHandler'
import { createSessionStartedEvent } from '../createSessionStartedEvent'
import { createGravityEvent } from '../createGravityEvent'
import { mockClick } from '../../test-utils/mocks'
import { EventType } from '../../types'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'
import { UNLOAD_EVENT_TYPE } from '../listener/UnloadEventListener'

describe('EventHandler', () => {
  describe('run', () => {
    const output = vitest.fn()

    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('outputs events if requestInterval=0', async () => {
      const eventHandler = new EventHandler('aaa-111', 0, output)
      eventHandler.run(createSessionStartedEvent())
      eventHandler.run(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(2)
    })

    it('outputs events if requestInterval>0', async () => {
      const eventHandler = new EventHandler('aaa-111', 5000, output)
      eventHandler.run(createSessionStartedEvent())
      eventHandler.run(mockGravityClickEvent())
      eventHandler.run(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(0)
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('outputs events if "unload" event has been handled', async () => {
      const eventHandler = new EventHandler('aaa-111', 5000, output)
      eventHandler.run(createSessionStartedEvent())
      eventHandler.run(mockGravityClickEvent())
      eventHandler.run(mockGravityClickEvent())
      eventHandler.run(createGravityEvent(new Event('unload'), UNLOAD_EVENT_TYPE))
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('skips outputs if no more buffered events', async () => {
      const eventHandler = new EventHandler('aaa-111', 5000, output)
      eventHandler.run(createSessionStartedEvent())
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      vitest.advanceTimersByTime(10000)
      expect(output).toHaveBeenCalledTimes(1)
    })
  })
})

function mockGravityClickEvent() {
  const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')
  return createGravityEvent(mockClick(element), EventType.Click)
}
