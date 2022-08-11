import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import EventHandler from '../../event/handler/EventHandler'
import { createSessionStartedUserAction } from '../../action/createSessionStartedUserAction'
import { createTargetedUserAction } from '../../action/createTargetedUserAction'
import { mockClick } from '../../test-utils/mocks'
import { UserActionType } from '../../types'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'
import { UNLOAD_USER_ACTION_TYPE } from '../listener/UnloadEventListener'

describe('EventHandler', () => {
  describe('run', () => {
    const output = vitest.fn()

    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('outputs actions if requestInterval=0', async () => {
      const eventHandler = new EventHandler('aaa-111', 0, output)
      eventHandler.run(createSessionStartedUserAction())
      eventHandler.run(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(2)
    })

    it('outputs actions if requestInterval>0', async () => {
      const eventHandler = new EventHandler('aaa-111', 5000, output)
      eventHandler.run(createSessionStartedUserAction())
      eventHandler.run(mockGravityClickEvent())
      eventHandler.run(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(0)
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('outputs actions if "unload" event has been handled', async () => {
      const eventHandler = new EventHandler('aaa-111', 5000, output)
      eventHandler.run(createSessionStartedUserAction())
      eventHandler.run(mockGravityClickEvent())
      eventHandler.run(mockGravityClickEvent())
      eventHandler.run(createTargetedUserAction(new Event('unload'), UNLOAD_USER_ACTION_TYPE))
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('skips outputs if no more buffered events', async () => {
      const eventHandler = new EventHandler('aaa-111', 5000, output)
      eventHandler.run(createSessionStartedUserAction())
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      vitest.advanceTimersByTime(10000)
      expect(output).toHaveBeenCalledTimes(1)
    })
  })
})

function mockGravityClickEvent() {
  const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')
  return createTargetedUserAction(mockClick(element), UserActionType.Click)
}
