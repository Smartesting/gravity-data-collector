import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import SessionStorageUserActionHandler from './SessionStorageUserActionHandler'
import { createSessionStartedUserAction } from '../createSessionStartedUserAction'
import createElementInJSDOM from '../../test-utils/createElementInJSDOM'
import { createClickUserAction } from '../../test-utils/userActions'

describe('SessionStorageUserActionHandler', () => {
  describe('run', () => {
    const output = vitest.fn()

    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('outputs actions if requestInterval=0', async () => {
      const userActionHandler = new SessionStorageUserActionHandler('aaa-111', 0, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(2)
    })

    it('outputs actions if requestInterval>0', async () => {
      const userActionHandler = new SessionStorageUserActionHandler('aaa-111', 5000, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockGravityClickEvent())
      userActionHandler.handle(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(0)
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('flush actions on demand (unload case)', async () => {
      const userActionHandler = new SessionStorageUserActionHandler('aaa-111', 5000, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockGravityClickEvent())
      userActionHandler.handle(mockGravityClickEvent())
      userActionHandler.flush()
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('skips outputs if no more buffered events', async () => {
      const userActionHandler = new SessionStorageUserActionHandler('aaa-111', 5000, output)
      userActionHandler.handle(createSessionStartedUserAction())
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      vitest.advanceTimersByTime(10000)
      expect(output).toHaveBeenCalledTimes(1)
    })
  })
})

function mockGravityClickEvent() {
  const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')
  return createClickUserAction(element)
}
