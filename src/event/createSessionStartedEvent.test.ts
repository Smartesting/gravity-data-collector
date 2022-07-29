import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import { createSessionStartedEvent } from './createSessionStartedEvent'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { EventType } from '../types'
import { config } from '../config'

describe('event', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  describe('createSessionStartedEvent', () => {
    it('returns a GravitySessionStartedEvent', () => {
      expect(createSessionStartedEvent().type).toBe(EventType.SessionStarted)
    })

    it('returns viewportData', () => {
      expect(createSessionStartedEvent().viewportData).toEqual(viewport())
    })

    it('returns collector version', () => {
      expect(createSessionStartedEvent().version).toEqual(config.COLLECTOR_VERSION)
    })

    it('returns user agent', () => {
      expect(createSessionStartedEvent().agent).toEqual(navigator.userAgent)
    })

    it('returns locationData', () => {
      expect(createSessionStartedEvent().location).toEqual(location())
    })

    it('returns recordedAt', () => {
      const now = new Date('2022-05-12').toISOString()
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      expect(createSessionStartedEvent().recordedAt).toEqual(now)
    })

    it('returns Cypress current test if any', () => {
      expect(createSessionStartedEvent().test).toBeUndefined()

      Object.defineProperty(window, 'Cypress', {
        value: {
          currentTest: {
            titlePath: ['foo', 'bar', 'testing stuff'],
          },
        },
      })

      expect(createSessionStartedEvent().test).toEqual('foo > bar > testing stuff')
    })
  })
})
