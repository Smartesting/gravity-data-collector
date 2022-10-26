import { beforeEach, describe, expect, it, vi } from 'vitest'
import EventListenersHandler from './EventListenersHandler'
import ClickEventListener from '../event-listeners/ClickEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import UserActionHandler from '../user-action/UserActionHandler'
import { nop } from '../utils/nop'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'

describe('EventListenersHandler', () => {
  let eventListenersHandler: EventListenersHandler
  let clickEventListener: ClickEventListener
  let beforeUnloadEventListener: BeforeUnloadEventListener
  let userActionsHistory: UserActionsHistory
  let userActionHandler: UserActionHandler

  beforeEach(() => {
    userActionsHistory = new MemoryUserActionsHistory()
    userActionHandler = new UserActionHandler('aaa-111', 0, nop, nop, userActionsHistory)

    clickEventListener = new ClickEventListener(userActionHandler, window)
    beforeUnloadEventListener = new BeforeUnloadEventListener(userActionHandler, window)

    eventListenersHandler = new EventListenersHandler([403, 409], [clickEventListener, beforeUnloadEventListener])
  })

  it('initializes all listeners', async () => {
    vi.spyOn(ClickEventListener.prototype, 'init')
    vi.spyOn(BeforeUnloadEventListener.prototype, 'init')

    eventListenersHandler.initializeEventListeners()

    expect(ClickEventListener.prototype.init).toHaveBeenCalledOnce()
    expect(BeforeUnloadEventListener.prototype.init).toHaveBeenCalledOnce()
  })

  it('terminates listeners when receiving a 403 error', async () => {
    vi.spyOn(ClickEventListener.prototype, 'terminate')
    vi.spyOn(BeforeUnloadEventListener.prototype, 'terminate')

    eventListenersHandler.getSenderErrorCallback()(403)

    expect(ClickEventListener.prototype.terminate).toHaveBeenCalledOnce()
    expect(BeforeUnloadEventListener.prototype.terminate).toHaveBeenCalledOnce()
  })

  it('terminates listeners when receiving a 409 error', async () => {
    vi.spyOn(ClickEventListener.prototype, 'terminate')
    vi.spyOn(BeforeUnloadEventListener.prototype, 'terminate')

    eventListenersHandler.getSenderErrorCallback()(409)

    expect(ClickEventListener.prototype.terminate).toHaveBeenCalledOnce()
    expect(BeforeUnloadEventListener.prototype.terminate).toHaveBeenCalledOnce()
  })

  it('does not terminate listeners when receiving a 404 error', async () => {
    vi.spyOn(ClickEventListener.prototype, 'terminate')
    vi.spyOn(BeforeUnloadEventListener.prototype, 'terminate')

    eventListenersHandler.getSenderErrorCallback()(404)

    expect(ClickEventListener.prototype.terminate).not.toHaveBeenCalled()
    expect(BeforeUnloadEventListener.prototype.terminate).not.toHaveBeenCalled()
  })
})
