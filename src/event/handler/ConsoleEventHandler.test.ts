import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../../test-utils/mocks'
import { createSessionEvent } from '../event'
import { ConsoleEventHandler } from './ConsoleEventHandler'

describe('ConsoleEventHandler', () => {
  describe('run', () => {
    let output: any[][]
    const outputer = (...data: any[]) => {
      output.push(data)
    }

    beforeEach(() => {
      mockWindowLocation()
      mockWindowScreen()

      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      output = []
    })

    it('print event to debug console', () => {
      const consoleEventHandler = new ConsoleEventHandler('abcd', 'aaa-111', outputer)
      const sessionEvent = createSessionEvent()
      consoleEventHandler.run(createSessionEvent())

      expect(output).toStrictEqual([['[GL DEBUG]'], ['Session: ', 'aaa-111'], ['authKey: ', 'abcd'], [sessionEvent]])
    })

    it('print event with delay in simulation mode', () => {
      const maxDelay = 2000
      const consoleEventHandler = new ConsoleEventHandler('abcd', 'aaa-111', outputer, {
        simulation: true,
        maxDelay,
      })
      const sessionEvent = createSessionEvent()
      consoleEventHandler.run(createSessionEvent())

      vi.advanceTimersByTime(maxDelay)

      expect(output).toEqual([['[GL DEBUG]'], ['Session: ', 'aaa-111'], ['authKey: ', 'abcd'], [sessionEvent]])
    })

    it('wait before print event with delay in simulation mode', () => {
      const consoleEventHandler = new ConsoleEventHandler('abcd', 'aaa-111', outputer, {
        simulation: true,
        maxDelay: 10000,
      })

      consoleEventHandler.run(createSessionEvent())
      expect(output).toEqual([])
    })
  })
})
