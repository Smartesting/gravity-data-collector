import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import SessionTraitHandler from './SessionTraitHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'

describe('SessionTraitHandler', () => {
  describe('handle', () => {
    const output = vitest.fn()
    const sessionId = 'aaa-111'
    const sessionIdHandler = new MemorySessionIdHandler(() => sessionId, 500)

    beforeEach(() => {
      vi.useFakeTimers()
      vi.restoreAllMocks()
    })

    it('outputs actions if requestInterval=0', async () => {
      const sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, 0, output)
      sessionTraitHandler.handle('connected', true)
      sessionTraitHandler.handle('type', 'premium')
      sessionTraitHandler.handle('age', 25)
      expect(output).toHaveBeenCalledTimes(3)
    })

    it('outputs actions if requestInterval>0', async () => {
      const sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, 5000, output)
      sessionTraitHandler.handle('connected', false)
      sessionTraitHandler.handle('type', 'premium')
      sessionTraitHandler.handle('age', 25)
      sessionTraitHandler.handle('connected', true)
      expect(output).toHaveBeenCalledTimes(0)
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      expect(output.mock.lastCall as any[]).toEqual([
        'aaa-111',
        {
          connected: true,
          type: 'premium',
          age: 25,
        },
      ])
    })

    it('flush actions on demand (unload case)', async () => {
      const sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, 5000, output)
      sessionTraitHandler.handle('connected', false)
      sessionTraitHandler.handle('type', 'premium')
      sessionTraitHandler.handle('age', 25)
      sessionTraitHandler.handle('connected', true)
      sessionTraitHandler.flush()
      expect(output).toHaveBeenCalledTimes(1)
      expect(output.mock.lastCall as any[]).toEqual([
        sessionId,
        {
          connected: true,
          type: 'premium',
          age: 25,
        },
      ])
    })

    it('skips outputs if no more buffered events', async () => {
      const sessionTraitHandler = new SessionTraitHandler(sessionIdHandler, 5000, output)
      sessionTraitHandler.handle('connected', false)
      vitest.advanceTimersByTime(5000)
      expect(output).toHaveBeenCalledTimes(1)
      vitest.advanceTimersByTime(10000)
      expect(output).toHaveBeenCalledTimes(1)
    })
  })
})
