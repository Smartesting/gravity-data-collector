import { vi, describe, beforeEach, it, expect } from 'vitest'
import {mockWindowScreen, mockWindowLocation} from '../test-utils/mocks'
import {createSessionEvent} from './createSessionEvent'
import EventType from './eventType'
import getLocationData from './getLocationData'
import getViewportData from './getViewportData'

describe('createSessionEvent', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  it('returns a GravitySessionStartedEvent', () => {
    expect(createSessionEvent().type).toBe(EventType.SessionStarted)
  })

  it('returns viewportData', () => {
    expect(createSessionEvent().viewportData).toEqual(getViewportData())
  })

  it('returns locationData', () => {
    expect(createSessionEvent().location).toEqual(getLocationData())
  })

  it('returns recordedAt', () => {
    const now = Date.parse('2022-05-12')
    vi.useFakeTimers()
    vi.setSystemTime(Date.parse('2022-05-12'))

    expect(createSessionEvent().recordedAt).toEqual(now)
  })

  it('returns Cypress current test if any', () => {
    expect(createSessionEvent().test).toBeUndefined()

    Object.defineProperty(window, "Cypress", {
      value: {
        currentTest: {
          titlePath: ["foo", "bar", "testing stuff"]
        }
      }
    })

    expect(createSessionEvent().test).toEqual("foo > bar > testing stuff")
  })
})