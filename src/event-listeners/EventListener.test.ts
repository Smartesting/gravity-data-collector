import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import MovementHandler from '../movement/MovementHandler'
import { waitFor } from '@testing-library/dom'
import { nop } from '../utils/nop'
import EventListener from '../event-listeners/EventListener'
import createElementInJSDOM from '../test-utils/createElementInJSDOM'
import { UserActionType } from '../types'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'

describe('EventListener', () => {
  const userActionType = UserActionType.Click
  const functionMock = vi.fn()

  class TestEventListener extends EventListener {
    constructor(window: Window) {
      const sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 500)
      super(new MovementHandler(sessionIdHandler, 0, nop), userActionType, window)
    }

    protected listener(event: Event): void {
      functionMock()
    }
  }

  let eventListener: EventListener

  beforeEach(() => {
    vitest.restoreAllMocks()
  })

  it('calls functionMock when listener has been initialized', async () => {
    const { domWindow } = createElementInJSDOM('<div/>', 'div')
    eventListener = new TestEventListener(domWindow)
    eventListener.init()

    domWindow.dispatchEvent(new Event(userActionType))

    await waitFor(() => {
      expect(functionMock).toHaveBeenCalledOnce()
    })
  })

  it('does not call functionMock when listener has been terminated', async () => {
    const { domWindow } = createElementInJSDOM('<div/>', 'div')
    eventListener.init()
    eventListener.terminate()

    domWindow.dispatchEvent(new Event(userActionType))

    await waitFor(() => {
      expect(functionMock).not.toHaveBeenCalled()
    })
  })
})
