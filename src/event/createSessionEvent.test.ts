import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import { createSessionEvent } from './createSessionEvent'
import viewport from '../utils/viewport'
import location from '../utils/location'
import pJson from '../../package.json'
import { EventType } from '../types'

describe('event', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  describe('createSessionEvent', () => {
    it('returns a GravitySessionStartedEvent', () => {
      expect(createSessionEvent().type).toBe(EventType.SessionStarted)
    })

    it('returns viewportData', () => {
      expect(createSessionEvent().viewportData).toEqual(viewport())
    })

    it('returns collector version', () => {
      expect(createSessionEvent().version).toEqual(pJson.version)
    })

    it('returns user agent', () => {
      expect(createSessionEvent().agent).toEqual(navigator.userAgent)
    })

    it('returns locationData', () => {
      expect(createSessionEvent().location).toEqual(location())
    })

    it('returns recordedAt', () => {
      const now = new Date('2022-05-12').toISOString()
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      expect(createSessionEvent().recordedAt).toEqual(now)
    })

    it('returns Cypress current test if any', () => {
      expect(createSessionEvent().test).toBeUndefined()

      Object.defineProperty(window, 'Cypress', {
        value: {
          currentTest: {
            titlePath: ['foo', 'bar', 'testing stuff'],
          },
        },
      })

      expect(createSessionEvent().test).toEqual('foo > bar > testing stuff')
    })
  })
})
