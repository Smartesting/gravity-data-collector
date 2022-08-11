import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import { createSessionStartedUserAction } from './createSessionStartedUserAction'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { UserActionType } from '../types'
import { config } from '../config'

describe('action', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  describe('createSessionStartedUserAction', () => {
    it('returns a SessionStartedUserAction', () => {
      expect(createSessionStartedUserAction().type).toBe(UserActionType.SessionStarted)
    })

    it('returns viewportData', () => {
      expect(createSessionStartedUserAction().viewportData).toEqual(viewport())
    })

    it('returns collector version', () => {
      expect(createSessionStartedUserAction().version).toEqual(config.COLLECTOR_VERSION)
    })

    it('returns user agent', () => {
      expect(createSessionStartedUserAction().agent).toEqual(navigator.userAgent)
    })

    it('returns locationData', () => {
      expect(createSessionStartedUserAction().location).toEqual(location())
    })

    it('returns recordedAt', () => {
      const now = new Date('2022-05-12').toISOString()
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      expect(createSessionStartedUserAction().recordedAt).toEqual(now)
    })

    it('returns Cypress current test if any', () => {
      expect(createSessionStartedUserAction().test).toBeUndefined()

      Object.defineProperty(window, 'Cypress', {
        value: {
          currentTest: {
            titlePath: ['foo', 'bar', 'testing stuff'],
          },
        },
      })

      expect(createSessionStartedUserAction().test).toEqual('foo > bar > testing stuff')
    })
  })
})
