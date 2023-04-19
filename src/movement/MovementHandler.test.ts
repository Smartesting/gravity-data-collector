import { beforeEach, describe, expect, it, SpyInstanceFn, vi, vitest } from 'vitest'
import MovementHandler from './MovementHandler'
import { createSessionStartedUserAction } from './createSessionStartedUserAction'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { Movement } from '../types'
import { mockClickUserAction } from '../test-utils/mocks'

describe('UserActionHandler', () => {
  describe('handle', () => {
    const output: SpyInstanceFn<[Movement[]], void> = vitest.fn()
    const onPublish = vitest.fn()
    const sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 500)

    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('outputs actions if requestInterval=0', async () => {
      const userActionHandler = new MovementHandler(sessionIdHandler, 0, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockClickUserAction())
      expect(output).toHaveBeenCalledTimes(2)
    })

    it('outputs actions if requestInterval>0', async () => {
      const userActionHandler = new MovementHandler(sessionIdHandler, 5000, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockClickUserAction())
      userActionHandler.handle(mockClickUserAction())
      expect(output).toHaveBeenCalledTimes(0)
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('flush actions on demand (unload case)', async () => {
      const userActionHandler = new MovementHandler(sessionIdHandler, 5000, output)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockClickUserAction())
      userActionHandler.handle(mockClickUserAction())
      userActionHandler.flush()
      expect(output).toHaveBeenCalledTimes(1)
      expect((output.mock.lastCall as any[])[0]).toHaveLength(3)
    })

    it('skips outputs if no more buffered events', async () => {
      const userActionHandler = new MovementHandler(sessionIdHandler, 5000, output)
      userActionHandler.handle(createSessionStartedUserAction())
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      vitest.advanceTimersByTime(10000)
      expect(output).toHaveBeenCalledTimes(1)
    })

    it('calls onPublish if it is defined', async () => {
      const userActionHandler = new MovementHandler(sessionIdHandler, 0, output, onPublish)
      userActionHandler.handle(createSessionStartedUserAction())
      userActionHandler.handle(mockClickUserAction())
      expect(onPublish).toHaveBeenCalledTimes(2)
    })
  })
})
