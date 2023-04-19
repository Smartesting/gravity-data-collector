import { beforeEach, describe, expect, it, vi } from 'vitest'
import EventListenersHandler from './EventListenersHandler'
import ClickEventListener from '../event-listeners/ClickEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import MemoryMovementsHistory from '../movement-history/MemoryMovementsHistory'
import MovementHandler from '../movement/MovementHandler'
import { nop } from '../utils/nop'
import MovementsHistory from '../movement-history/MovementsHistory'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'

describe('EventListenersHandler', () => {
  let eventListenersHandler: EventListenersHandler
  let clickEventListener: ClickEventListener
  let beforeUnloadEventListener: BeforeUnloadEventListener
  let userActionsHistory: MovementsHistory
  let userActionHandler: MovementHandler

  beforeEach(() => {
    userActionsHistory = new MemoryMovementsHistory()
    const sessionIdHandler = new MemorySessionIdHandler(() => 'aaa-111', 500)
    userActionHandler = new MovementHandler(sessionIdHandler, 0, nop, nop, userActionsHistory)
    clickEventListener = new ClickEventListener(userActionHandler, window)
    beforeUnloadEventListener = new BeforeUnloadEventListener(userActionHandler, window)
    eventListenersHandler = new EventListenersHandler([clickEventListener, beforeUnloadEventListener])
  })

  it('initializes all listeners when the initialize function is called', async () => {
    vi.spyOn(ClickEventListener.prototype, 'init')
    vi.spyOn(BeforeUnloadEventListener.prototype, 'init')

    eventListenersHandler.initializeEventListeners()

    expect(ClickEventListener.prototype.init).toHaveBeenCalledOnce()
    expect(BeforeUnloadEventListener.prototype.init).toHaveBeenCalledOnce()
  })

  it('terminates listeners when the terminate function is called', async () => {
    vi.spyOn(ClickEventListener.prototype, 'terminate')
    vi.spyOn(BeforeUnloadEventListener.prototype, 'terminate')

    eventListenersHandler.terminateEventListeners()

    expect(ClickEventListener.prototype.terminate).toHaveBeenCalledOnce()
    expect(BeforeUnloadEventListener.prototype.terminate).toHaveBeenCalledOnce()
  })
})
