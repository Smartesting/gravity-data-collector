import { beforeEach, describe, expect, it, vitest } from 'vitest'
import MovementHandler from '../movement/MovementHandler'
import { waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'

describe('BeforeUnloadEventListener', () => {
  describe('listener', () => {
    const sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 500)
    const userActionHandler = new MovementHandler(sessionIdHandler, 0, nop)
    const flushSpy = vitest.spyOn(userActionHandler, 'flush')

    beforeEach(() => {
      vitest.restoreAllMocks()
    })

    it('calls handler when beforeunload event been fired', async () => {
      const { domWindow } = createElementInJSDOM('<div/>', 'div')
      new BeforeUnloadEventListener(userActionHandler, domWindow).init()
      domWindow.dispatchEvent(new Event('beforeunload'))

      await waitFor(() => {
        expect(flushSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
