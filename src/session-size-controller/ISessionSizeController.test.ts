import { beforeEach, describe, it } from 'vitest'
import assert from 'assert'
import ISessionSizeController from './ISessionSizeController'
import { MemorySessionSizeController } from './MemorySessionSizeController'
import { CookieSessionSizeController } from './CookieSessionSizeController'

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
      it(' checks the configured threshold of user actions is reached', () => {
        for (let pendingUserActionCount = 0; pendingUserActionCount < THRESHOLD; pendingUserActionCount++) {
          assert.strictEqual(sessionSizeController.checkThreshold(pendingUserActionCount), false)
        }
        assert.strictEqual(sessionSizeController.checkThreshold(THRESHOLD), true)
        assert.strictEqual(sessionSizeController.checkThreshold(0), true)
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
