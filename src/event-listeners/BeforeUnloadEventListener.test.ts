import { beforeEach, describe, expect, it, vitest } from 'vitest'
import MemoryUserActionHandler from '../user-action/handler/MemoryUserActionHandler'
import { waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'

describe('BeforeUnloadEventListener', () => {
  describe('listener', () => {
    const userActionHandler = new MemoryUserActionHandler('aaa-111', 0, nop)
    const flushSpy = vitest.spyOn(userActionHandler, 'flush')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls listener when beforeunload event been fired', async () => {
      const { domWindow } = createElementInJSDOM('<div/>', 'div')
      new BeforeUnloadEventListener(userActionHandler, domWindow).init()
      domWindow.dispatchEvent(new Event('beforeunload'))

      await waitFor(() => {
        expect(flushSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
