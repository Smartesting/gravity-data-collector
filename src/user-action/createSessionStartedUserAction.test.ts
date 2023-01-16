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

    it('sets buildId field when GRAVITY_BUILD_ID env var is set', () => {
      process.env.GRAVITY_BUILD_ID = '51'
      expect(createSessionStartedUserAction().buildId).toEqual('51')
    })

    it('does not set buildId field when GRAVITY_BUILD_ID is empty', () => {
      process.env.GRAVITY_BUILD_ID = ''
      expect(createSessionStartedUserAction().buildId).toEqual(undefined)
    })

    it('sets buildId field when REACT_APP_GRAVITY_BUILD_ID env var is set', () => {
      process.env.REACT_APP_GRAVITY_BUILD_ID = '42'
      expect(createSessionStartedUserAction().buildId).toEqual('42')
    })

    it('does not set buildId field when REACT_APP_GRAVITY_BUILD_ID is empty', () => {
      process.env.REACT_APP_GRAVITY_BUILD_ID = ''
      expect(createSessionStartedUserAction().buildId).toEqual(undefined)
    })

    it('sets buildId field from GRAVITY_BUILD_ID when GRAVITY_BUILD_ID and REACT_APP_GRAVITY_BUILD_ID are set', () => {
      process.env.GRAVITY_BUILD_ID = '12'
      process.env.REACT_APP_GRAVITY_BUILD_ID = '13'
      expect(createSessionStartedUserAction().buildId).toEqual('12')
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
