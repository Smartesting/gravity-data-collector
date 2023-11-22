import { beforeEach, describe, expect, it, vi } from 'vitest'
import EventListenersHandler from './EventListenersHandler'
import ClickEventListener from '../event-listeners/ClickEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import IUserActionHandler, { NopUserActionHandler } from '../user-action/IUserActionHandler'

describe('EventListenersHandler', () => {
  let eventListenersHandler: EventListenersHandler
  let clickEventListener: ClickEventListener
  let beforeUnloadEventListener: BeforeUnloadEventListener
  let userActionHandler: IUserActionHandler

  beforeEach(() => {
    userActionHandler = new NopUserActionHandler()
    clickEventListener = new ClickEventListener(userActionHandler, window)
    beforeUnloadEventListener = new BeforeUnloadEventListener(userActionHandler, window, () => {})
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
