import { beforeEach, describe, expect, it, vi } from 'vitest'
import ClickEventListener from '../event-listeners/ClickEventListener'
import BeforeUnloadEventListener from '../event-listeners/BeforeUnloadEventListener'
import MemoryUserActionsHistory from '../user-actions-history/MemoryUserActionsHistory'
import UserActionHandler from '../user-action/UserActionHandler'
import { nop } from '../utils/nop'
import UserActionsHistory from '../user-actions-history/UserActionsHistory'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import TrackingHandler, { GRAVITY_SESSION_TRACKING_SUSPENDED } from './TrackingHandler'

describe('EventListenersHandler', () => {
  let trackingHandler: TrackingHandler
  let eventListenersHandler: EventListenersHandler
  let clickEventListener: ClickEventListener
  let beforeUnloadEventListener: BeforeUnloadEventListener
  let userActionsHistory: UserActionsHistory
  let userActionHandler: UserActionHandler

  beforeEach(() => {
    userActionsHistory = new MemoryUserActionsHistory()
    userActionHandler = new UserActionHandler('aaa-111', 0, nop, nop, userActionsHistory)

    eventListenersHandler = new EventListenersHandler([])
    trackingHandler = new TrackingHandler([403,409])

    window.sessionStorage.clear()
  })

  it('activates tracking if enabled', async () => {
    vi.spyOn(TrackingHandler.prototype, 'activateTracking')
    trackingHandler.init(eventListenersHandler)
    expect(TrackingHandler.prototype.activateTracking).toHaveBeenCalledOnce()
  })

  it('does not activate tracking if disabled', async () => {
    vi.spyOn(TrackingHandler.prototype, 'activateTracking')

    window.sessionStorage.setItem(GRAVITY_SESSION_TRACKING_SUSPENDED, '1')
    trackingHandler.init(eventListenersHandler)

    expect(TrackingHandler.prototype.activateTracking).not.toHaveBeenCalled()
  })


  it('disable tracking when receiving a 403 error', async () => {
    vi.spyOn(TrackingHandler.prototype, 'deactivateTracking')

    trackingHandler.init(eventListenersHandler)
    trackingHandler.getSenderErrorCallback()(403)

    expect(trackingHandler.isTracking()).toBeFalsy()
    expect(TrackingHandler.prototype.deactivateTracking).toHaveBeenCalledOnce()
  })

  it('disable tracking when receiving a 409 error', async () => {
    vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')

    trackingHandler.init(eventListenersHandler)
    trackingHandler.getSenderErrorCallback()(409)

    expect(EventListenersHandler.prototype.terminateEventListeners).toHaveBeenCalledOnce()
  })

  it('does not disable tracking when receiving a 404 error', async () => {
    vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')

    trackingHandler.init(eventListenersHandler)
    trackingHandler.getSenderErrorCallback()(404)

    expect(EventListenersHandler.prototype.terminateEventListeners).not.toHaveBeenCalled()
  })

  it('throws an error if handler has not been initialized before activating tracking', async () => {
    expect(trackingHandler.activateTracking()).toThrowError()
  })

  it('throws an error if handler has not been initialized before deactivating tracking', async () => {
    expect(trackingHandler.deactivateTracking()).toThrowError()
  })
})
