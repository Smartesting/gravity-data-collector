import { beforeEach, describe, expect, it, vi } from 'vitest'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import TrackingHandler, { GRAVITY_SESSION_TRACKING_SUSPENDED } from './TrackingHandler'

describe('TrackingHandler', () => {
  let trackingHandler: TrackingHandler
  let eventListenersHandler: EventListenersHandler

  beforeEach(() => {
    eventListenersHandler = new EventListenersHandler([])
    trackingHandler = new TrackingHandler([403, 409])

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
    expect(function () {
      trackingHandler.activateTracking()
    }).toThrowError()
  })

  it('throws an error if handler has not been initialized before deactivating tracking', async () => {
    expect(function () {
      trackingHandler.deactivateTracking()
    }).toThrowError()
  })

  it('does not track if no active', async () => {
    expect(trackingHandler.isTracking()).toBeTruthy()
    trackingHandler.init(eventListenersHandler)

    trackingHandler.setActive(false)
    expect(trackingHandler.isTracking()).toBeFalsy()

    trackingHandler.activateTracking()
    expect(trackingHandler.isTracking()).toBeFalsy()

    trackingHandler.setActive(true)
    expect(trackingHandler.isTracking()).toBeTruthy()
  })
})
