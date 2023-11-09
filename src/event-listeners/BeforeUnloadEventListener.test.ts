import { beforeEach, describe, expect, it, SpyInstance, vitest } from 'vitest'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { NopUserActionHandler } from '../user-action/IUserActionHandler'

describe('BeforeUnloadEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new NopUserActionHandler()
    let flushSpy: SpyInstance<[], void>

    beforeEach(() => {
      flushSpy = vitest.spyOn(userActionHandler, 'flush')
    })

    afterEach(() => {
      flushSpy.mockRestore()
    })

    it('calls handler when beforeunload event has been fired', async () => {
      const { domWindow } = createElementInJSDOM('<div/>', 'div')
      new BeforeUnloadEventListener(userActionHandler, domWindow).init()
      domWindow.dispatchEvent(new Event('beforeunload'))
      expect(flushSpy).toHaveBeenCalledOnce()
    })
  })
})
