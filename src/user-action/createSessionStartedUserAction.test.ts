import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import { createSessionStartedUserAction } from './createSessionStartedUserAction'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { TestContext, TestingTool, UserActionType } from '../types'
import { config } from '../config'
import assert from 'assert'

describe('action', () => {
  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  beforeEach(() => {
    delete (window as any).Cypress
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
      withPatchedProperties(process.env, { GRAVITY_BUILD_ID: '51' }, () =>
        expect(createSessionStartedUserAction().buildId).toEqual('51'),
      )
    })

    it('sets buildId field when GRAVITY_BUILD_ID is set on the window', () => {
      withPatchedProperties(window, { GRAVITY_BUILD_ID: '123' }, () =>
        expect(createSessionStartedUserAction().buildId).toEqual('123'),
      )
    })

    it('does not set buildId field when GRAVITY_BUILD_ID is empty', () => {
      withPatchedProperties(process.env, { GRAVITY_BUILD_ID: '' }, () =>
        expect(createSessionStartedUserAction().buildId).toEqual(undefined),
      )
    })

    it('sets buildId field when REACT_APP_GRAVITY_BUILD_ID env var is set', () => {
      withPatchedProperties(process.env, { REACT_APP_GRAVITY_BUILD_ID: '42' }, () =>
        expect(createSessionStartedUserAction().buildId).toEqual('42'),
      )
    })

    it('does not set buildId field when REACT_APP_GRAVITY_BUILD_ID is empty', () => {
      withPatchedProperties(process.env, { REACT_APP_GRAVITY_BUILD_ID: '' }, () =>
        expect(createSessionStartedUserAction().buildId).toEqual(undefined),
      )
    })

    it('sets buildId field from GRAVITY_BUILD_ID when GRAVITY_BUILD_ID and REACT_APP_GRAVITY_BUILD_ID are set', () => {
      withPatchedProperties(
        process.env,
        {
          GRAVITY_BUILD_ID: '12',
          REACT_APP_GRAVITY_BUILD_ID: '13',
        },
        () => expect(createSessionStartedUserAction().buildId).toEqual('12'),
      )
    })

    it('returns Cypress current test if any', () => {
      expect(createSessionStartedUserAction().test).toBeUndefined()
      ;(window as any).Cypress = {
        currentTest: {
          titlePath: ['foo', 'bar', 'testing stuff'],
        },
      }

      expect(createSessionStartedUserAction().test).toEqual('foo > bar > testing stuff')
    })

    it('returns Cypress current test context if any', () => {
      expect(createSessionStartedUserAction().testContext).toBeUndefined()

      Object.defineProperty(window, 'Cypress', {
        value: {
          currentTest: {
            title: 'My test',
            titlePath: ['My suite', 'My test'],
          },
          mocha: {
            getRunner() {
              return {
                suite: {
                  file: 'my-test-file.cy.ts',
                  title: 'My suite',
                },
              }
            },
          },
        },
      })
      const expectedTestContext: TestContext = {
        title: 'My test',
        titlePath: ['My suite', 'My test'],
        testingTool: TestingTool.CYPRESS,
        suite: {
          file: 'my-test-file.cy.ts',
          title: 'My suite',
        },
      }
      assert.deepStrictEqual(createSessionStartedUserAction().testContext, expectedTestContext)
    })
  })
})

function withPatchedProperties<T>(toPatch: unknown, properties: T, callBack: () => void) {
  const originalProperties = Object.fromEntries(
    Object.entries(properties).map(([key]) => {
      return [key, (toPatch as T)[key]]
    }),
  )
  Object.entries(properties).map(([key, value]) =>
    Object.defineProperty(toPatch, key, { value, writable: true, configurable: true }),
  )

  try {
    callBack()
  } finally {
    Object.entries(originalProperties).forEach(([key, value]) => {
      if (value === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (toPatch as T)[key]
      } else {
        Object.defineProperty(toPatch, key, { value })
      }
    })
  }
}
