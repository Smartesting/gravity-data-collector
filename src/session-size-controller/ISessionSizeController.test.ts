import { beforeEach, describe, it } from 'vitest'
import assert from 'assert'
import ISessionSizeController from './ISessionSizeController'
import { MemorySessionSizeController } from './MemorySessionSizeController'
import { CookieSessionSizeController } from './CookieSessionSizeController'
import { TargetedUserAction, UserActionType } from '../types'

const THRESHOLD = 5

function iSessionSizeControllerContractTest(
  implementationName: string,
  makeSessionSizeController: () => ISessionSizeController,
  cleanup: () => void,
) {
  describe(implementationName, () => {
    let sessionSizeController: ISessionSizeController
    beforeEach(() => {
      cleanup()
      sessionSizeController = makeSessionSizeController()
    })

    describe('checkThreshold', () => {
      it('returns the pending user actions if and only if the threshold of user actions is reached', () => {
        for (let i = 1; i < THRESHOLD; i++) {
          assert.strictEqual(sessionSizeController.checkThreshold([mockTargetedUserAction(`element_${i}`)]).length, 0)
        }
        const userActions = sessionSizeController.checkThreshold([
          mockTargetedUserAction(`element_${THRESHOLD}`),
        ]) as readonly TargetedUserAction[]
        assert.strictEqual(userActions.length, THRESHOLD)
        assert.strictEqual(userActions[0].target.element, 'element_1')
        assert.strictEqual(userActions[1].target.element, 'element_2')
        assert.strictEqual(userActions[2].target.element, 'element_3')
        assert.strictEqual(userActions[3].target.element, 'element_4')
        assert.strictEqual(userActions[4].target.element, 'element_5')

        const newUserActions = sessionSizeController.checkThreshold([
          mockTargetedUserAction('another one'),
        ]) as readonly TargetedUserAction[]
        assert.strictEqual(newUserActions.length, 1)
        assert.strictEqual(newUserActions[0].target.element, 'another one')
      })
    })
  })
}

iSessionSizeControllerContractTest(
  'MemorySessionIdHandler',
  () => new MemorySessionSizeController(THRESHOLD),
  () => {},
)

iSessionSizeControllerContractTest(
  'CookieSessionIdHandler',
  () => new CookieSessionSizeController(THRESHOLD),
  clearCookies,
)

function clearCookies() {
  document.cookie = ''
}

function mockTargetedUserAction(element: string): TargetedUserAction {
  return {
    document: { title: '' },
    location: { href: '', pathname: '', search: '' },
    target: { element },
    type: UserActionType.Click,
    viewportData: {},
  }
}
