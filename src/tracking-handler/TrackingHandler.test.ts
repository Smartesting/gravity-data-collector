import { beforeEach, describe, expect, it, vi } from 'vitest'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import TrackingHandler, { GRAVITY_SESSION_TRACKING_SUSPENDED } from './TrackingHandler'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import NopGravityClient from '../gravity-client/NopGravityClient'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'

describe('TrackingHandler', () => {
  let trackingHandler: TrackingHandler
  let eventListenersHandler: EventListenersHandler
  let screenRecorderHandler: ScreenRecorderHandler

  beforeEach(() => {
    eventListenersHandler = new EventListenersHandler([])
    const gravityClient = new NopGravityClient(0)
    const sessionIdHandler = new MemorySessionIdHandler(() => '123', 4)
    screenRecorderHandler = new ScreenRecorderHandler(sessionIdHandler, gravityClient)
    trackingHandler = new TrackingHandler([403, 409])

    window.sessionStorage.clear()
  })

  it('activates tracking if enabled', async () => {
    vi.spyOn(TrackingHandler.prototype, 'activateTracking')
    trackingHandler.init(eventListenersHandler, screenRecorderHandler)
    expect(TrackingHandler.prototype.activateTracking).toHaveBeenCalledOnce()
  })

  it('does not activate tracking if disabled', async () => {
    vi.spyOn(TrackingHandler.prototype, 'activateTracking')

    window.sessionStorage.setItem(GRAVITY_SESSION_TRACKING_SUSPENDED, '1')
    trackingHandler.init(eventListenersHandler, screenRecorderHandler)

    expect(TrackingHandler.prototype.activateTracking).not.toHaveBeenCalled()
  })

  it('disable tracking when receiving a 403 error', async () => {
    vi.spyOn(TrackingHandler.prototype, 'deactivateTracking')

    trackingHandler.init(eventListenersHandler, screenRecorderHandler)
    trackingHandler.senderErrorCallback(403)

    expect(trackingHandler.isTracking()).toBeFalsy()
    expect(TrackingHandler.prototype.deactivateTracking).toHaveBeenCalledOnce()
  })

  it('disable tracking when receiving a 409 error', async () => {
    vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')
    vi.spyOn(ScreenRecorderHandler.prototype, 'terminateRecording')

    trackingHandler.init(eventListenersHandler, screenRecorderHandler)
    trackingHandler.senderErrorCallback(409)

    expect(EventListenersHandler.prototype.terminateEventListeners).toHaveBeenCalledOnce()
    expect(ScreenRecorderHandler.prototype.terminateRecording).toHaveBeenCalledOnce()
  })

  it('does not disable tracking when receiving a 404 error', async () => {
    vi.spyOn(EventListenersHandler.prototype, 'terminateEventListeners')
    vi.spyOn(ScreenRecorderHandler.prototype, 'terminateRecording')

    trackingHandler.init(eventListenersHandler, screenRecorderHandler)
    trackingHandler.senderErrorCallback(404)

    expect(EventListenersHandler.prototype.terminateEventListeners).not.toHaveBeenCalled()
    expect(ScreenRecorderHandler.prototype.terminateRecording).not.toHaveBeenCalled()
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
    trackingHandler.init(eventListenersHandler, screenRecorderHandler)

    trackingHandler.setActive(false)
    expect(trackingHandler.isTracking()).toBeFalsy()

    trackingHandler.activateTracking()
    expect(trackingHandler.isTracking()).toBeFalsy()

    trackingHandler.setActive(true)
    expect(trackingHandler.isTracking()).toBeTruthy()
  })
})
