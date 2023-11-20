import { describe, expect, it, vi } from 'vitest'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { NopUserActionHandler } from '../user-action/IUserActionHandler'

describe('BeforeUnloadEventListener', () => {
  describe('listener', () => {
    it('calls handler when beforeunload event has been fired', async () => {
      const { domWindow } = createElementInJSDOM('<div/>', 'div')
      const onDispose = vi.fn()
      new BeforeUnloadEventListener(new NopUserActionHandler(), domWindow, onDispose).init()
      domWindow.dispatchEvent(new Event('beforeunload'))
      expect(onDispose).toHaveBeenCalledOnce()
    })
  })
})
