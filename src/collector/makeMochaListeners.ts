import { CypressObject, IEventHandler } from '../types'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import { MochaListener } from '../cypress-listeners/MochaListener'

export function makeMochaListeners(
  cypress: CypressObject,
  sessionIdHandler: ISessionIdHandler,
  eventHandler?: IEventHandler,
) {
  // @ts-expect-error
  const mocha = cypress.mocha ?? undefined
  if (mocha !== undefined) {
    const runner = mocha.getRunner() ?? undefined
    if (runner !== undefined) {
      console.log('Install Mocha listeners', { runner }) // FIXME remove
      return Object.keys(RUNNER_CONSTANTS)
        .map((event) => new MochaListener(runner, event))
        .concat(Object.keys(SUITE_CONSTANTS).map((event) => new MochaListener(runner, event)))
    }
  }
  return []
}

enum RUNNER_CONSTANTS {
  EVENT_HOOK_BEGIN = 'hook',
  EVENT_HOOK_END = 'hook end',
  EVENT_RUN_BEGIN = 'start',
  EVENT_DELAY_BEGIN = 'waiting',
  EVENT_DELAY_END = 'ready',
  EVENT_RUN_END = 'end',
  EVENT_SUITE_BEGIN = 'suite',
  EVENT_SUITE_END = 'suite end',
  EVENT_TEST_BEGIN = 'test',
  EVENT_TEST_END = 'test end',
  EVENT_TEST_FAIL = 'fail',
  EVENT_TEST_PASS = 'pass',
  EVENT_TEST_PENDING = 'pending',
  EVENT_TEST_RETRY = 'retry',
}

enum SUITE_CONSTANTS {
  EVENT_FILE_POST_REQUIRE = 'post-require',
  EVENT_FILE_PRE_REQUIRE = 'pre-require',
  EVENT_FILE_REQUIRE = 'require',
  EVENT_ROOT_SUITE_RUN = 'run',

  HOOK_TYPE_AFTER_ALL = 'afterAll',
  HOOK_TYPE_AFTER_EACH = 'afterEach',
  HOOK_TYPE_BEFORE_ALL = 'beforeAll',
  HOOK_TYPE_BEFORE_EACH = 'beforeEach',

  EVENT_SUITE_ADD_HOOK_AFTER_ALL = 'afterAll',
  EVENT_SUITE_ADD_HOOK_AFTER_EACH = 'afterEach',
  EVENT_SUITE_ADD_HOOK_BEFORE_ALL = 'beforeAll',
  EVENT_SUITE_ADD_HOOK_BEFORE_EACH = 'beforeEach',
  EVENT_SUITE_ADD_SUITE = 'suite',
  EVENT_SUITE_ADD_TEST = 'test',
}
