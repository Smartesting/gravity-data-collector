import { beforeEach, describe, expect, it, SpyInstanceFn, vi, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { createSessionStartedUserAction } from './createSessionStartedUserAction'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { createClickUserAction } from '../test-utils/userActions'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { MemorySessionSizeController } from '../session-size-controller/MemorySessionSizeController'
import { SessionUserAction } from '../types'
import assert from 'assert'

describe('UserActionHandler', () => {
  describe('handle', () => {
    const output: SpyInstanceFn<[SessionUserAction[]], void> = vitest.fn()
    const onPublish = vitest.fn()
    const sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 500)
    const sessionSizeController = new MemorySessionSizeController(1)

    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('outputs actions if requestInterval=0', async () => {
      const userActionHandler = new UserActionHandler(sessionIdHandler, 0, sessionSizeController, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(2)
    })

    it('outputs actions if requestInterval>0', async () => {
      const userActionHandler = new UserActionHandler(sessionIdHandler, 5000, sessionSizeController, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockGravityClickEvent())
      userActionHandler.handle(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(0)
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('flush actions on demand (unload case)', async () => {
      const userActionHandler = new UserActionHandler(sessionIdHandler, 5000, sessionSizeController, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockGravityClickEvent())
      userActionHandler.handle(mockGravityClickEvent())
      userActionHandler.flush()
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('skips outputs if no more buffered events', async () => {
      const userActionHandler = new UserActionHandler(sessionIdHandler, 5000, sessionSizeController, output)
      userActionHandler.handle(createSessionStartedUserAction())
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      vitest.advanceTimersByTime(10000)
      expect(output).toHaveBeenCalledTimes(1)
    })

    it('calls onPublish if it is defined', async () => {
      const userActionHandler = new UserActionHandler(sessionIdHandler, 0, sessionSizeController, output, onPublish)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockGravityClickEvent())
      expect(onPublish).toHaveBeenCalledTimes(2)
    })

    it('flush actions if and only if minimal quota of user actions is reached (option "minimumUserActions") ', () => {
      const threshold = 5
      const sizeController = new MemorySessionSizeController(threshold)
      const userActionHandler = new UserActionHandler(sessionIdHandler, 0, sizeController, output)
      for (let i = 1; i < threshold; i++) {
        userActionHandler.handle(mockGravityClickEvent())
        expect(output).toHaveBeenCalledTimes(0)
      }
      userActionHandler.handle(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(1)
      assert(output.mock.lastCall)
      expect(output.mock.lastCall[0]).toHaveLength(threshold)
      userActionHandler.handle(mockGravityClickEvent())
      expect(output).toHaveBeenCalledTimes(2)
      assert(output.mock.lastCall)
      expect(output.mock.lastCall[0]).toHaveLength(1)
    })
  })
})

function mockGravityClickEvent() {
  const { element } = createElementInJSDOM('<div>Click Me</div>', 'div')
  return createClickUserAction(element)
}
