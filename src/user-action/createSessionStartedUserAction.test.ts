import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWindowLocation, mockWindowScreen } from '../test-utils/mocks'
import { createSessionStartedUserAction } from './createSessionStartedUserAction'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { TestContext, TestingTool, UserActionType } from '../types'
import { config } from '../config'
import assert from 'assert'

describe('action', () => {
  const windowInstance = window

  beforeEach(() => {
    mockWindowScreen()
    mockWindowLocation()
  })

  beforeEach(() => {
    delete (window as any).Cypress
  })

  describe('createSessionStartedUserAction', () => {
    it('returns a SessionStartedUserAction', () => {
      expect(createSessionStartedUserAction(windowInstance).type).toBe(UserActionType.SessionStarted)
    })

    it('returns viewportData', () => {
      expect(createSessionStartedUserAction(windowInstance).viewportData).toEqual(viewport(windowInstance))
    })

    it('returns collector version', () => {
      expect(createSessionStartedUserAction(windowInstance).version).toEqual(config.COLLECTOR_VERSION)
    })

    it('returns user agent', () => {
      expect(createSessionStartedUserAction(windowInstance).agent).toEqual(navigator.userAgent)
    })

    it('returns locationData', () => {
      expect(createSessionStartedUserAction(windowInstance).location).toEqual(location(windowInstance))
    })

    it('returns recordedAt', () => {
      const now = new Date('2022-05-12').toISOString()
      vi.useFakeTimers()
      vi.setSystemTime(Date.parse('2022-05-12'))

      expect(createSessionStartedUserAction(windowInstance).recordedAt).toEqual(now)
    })

    describe('when GRAVITY_BUILD_ID env var is set', () => {
      beforeEach(() => {
        vi.stubEnv('GRAVITY_BUILD_ID', '51')
      })

      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it('sets buildId field from env', () => {
        expect(createSessionStartedUserAction(windowInstance).buildId).toEqual('51')
      })
    })

    it('sets buildId field when GRAVITY_BUILD_ID is set on the window', () => {
      withPatchedProperties(window, { GRAVITY_BUILD_ID: '123' }, () =>
        expect(createSessionStartedUserAction(windowInstance).buildId).toEqual('123'),
      )
    })

    describe('when GRAVITY_BUILD_ID is empty', () => {
      beforeEach(() => {
        vi.stubEnv('GRAVITY_BUILD_ID', '')
      })

      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it('does not set buildId field', () => {
        expect(createSessionStartedUserAction(windowInstance).buildId).toEqual(undefined)
      })
    })

    describe('when REACT_APP_GRAVITY_BUILD_ID env var is set', () => {
      beforeEach(() => {
        vi.stubEnv('REACT_APP_GRAVITY_BUILD_ID', '42')
      })

      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it('sets buildId field', () => {
        expect(createSessionStartedUserAction(windowInstance).buildId).toEqual('42')
      })
    })

    describe('when REACT_APP_GRAVITY_BUILD_ID is empty', () => {
      beforeEach(() => {
        vi.stubEnv('REACT_APP_GRAVITY_BUILD_ID', '')
      })

      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it('does not set buildId field', () => {
        expect(createSessionStartedUserAction(windowInstance).buildId).toEqual(undefined)
      })
    })

    describe('when GRAVITY_BUILD_ID and REACT_APP_GRAVITY_BUILD_ID are set', () => {
      beforeEach(() => {
        vi.stubEnv('GRAVITY_BUILD_ID', '12')
        vi.stubEnv('REACT_APP_GRAVITY_BUILD_ID', '13')
      })

      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it('sets buildId field from GRAVITY_BUILD_ID', () => {
        expect(createSessionStartedUserAction(windowInstance).buildId).toEqual('12')
      })
    })

    it('returns Cypress current test if any', () => {
      expect(createSessionStartedUserAction(windowInstance).test).toBeUndefined()
      ;(window as any).Cypress = {
        currentTest: {
          titlePath: ['foo', 'bar', 'testing stuff'],
        },
      }

      expect(createSessionStartedUserAction(windowInstance).test).toEqual('foo > bar > testing stuff')
    })

    it('returns Cypress current test context if any', () => {
      expect(createSessionStartedUserAction(windowInstance).testContext).toBeUndefined()

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
      assert.deepStrictEqual(createSessionStartedUserAction(windowInstance).testContext, expectedTestContext)
    })
  })
})

function withPatchedProperties<T extends { [key: string]: any }>(
  toPatch: unknown,
  properties: T,
  callBack: () => void,
) {
  const originalProperties = Object.fromEntries(
    Object.entries(properties).map(([key]) => {
      return [key, (toPatch as T)[key]]
    }),
  )
  Object.entries(properties).map(([key, value]) =>
    Object.defineProperty(toPatch, key, {
      value,
      writable: true,
      configurable: true,
    }),
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
