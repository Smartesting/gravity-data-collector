import { beforeEach, describe, expect, it, vitest } from 'vitest'
import UserActionHandler from '../user-action/UserActionHandler'
import { waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import UnloadEventListener from '../event-listeners/UnloadEventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'

describe('UnloadEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new UserActionHandler('aaa-111', 0, nop)
    const flushSpy = vitest.spyOn(userActionHandler, 'flush')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when unload event been fired', async () => {
      const { domWindow } = createElementInJSDOM('<div/>', 'div')
      new UnloadEventListener(userActionHandler, domWindow).init()
      domWindow.dispatchEvent(new Event('unload'))

      await waitFor(() => {
        expect(flushSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
