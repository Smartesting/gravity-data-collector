import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import WebVitalsHandler from './WebVitalsHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { Metric } from 'web-vitals'
import TrackingHandler from '../tracking-handler/TrackingHandler'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import { mockWindowLocation } from '../test-utils/mocks'
import location from '../utils/location'
import ScreenRecorderHandler from '../screen-recorder/ScreenRecorderHandler'
import NopGravityClient from '../gravity-client/NopGravityClient'
import { IGravityClient } from '../gravity-client/IGravityClient'

describe('WebVitalsHandler', () => {
  describe('handle', () => {
    const sessionId = 'aaa-111'
    const sessionIdHandler = new MemorySessionIdHandler(() => sessionId, 500)
    const metric: Metric = {
      name: 'LCP',
      value: 50,
      rating: 'good',
      delta: 50,
      entries: [],
      id: 'v3-1689682976807-3720147479835',
      navigationType: 'navigate',
    }
    let trackingHandler: TrackingHandler
    let gravityClient: IGravityClient

    beforeEach(() => {
      window.sessionStorage.clear()
      mockWindowLocation()
      vi.useFakeTimers()
      vi.restoreAllMocks()
      gravityClient = new NopGravityClient(0)
      trackingHandler = new TrackingHandler([])
      trackingHandler.init(
        new EventListenersHandler([]),
        new ScreenRecorderHandler(sessionIdHandler, new NopGravityClient(0)),
      )
    })

    it('does not call output if tracking is disabled', async () => {
      const spy = vitest.spyOn(gravityClient, 'monitorSession')
      const webVitalsHandler = new WebVitalsHandler(sessionIdHandler, trackingHandler, gravityClient)
      trackingHandler.deactivateTracking()
      webVitalsHandler.flush(metric)
      expect(spy).toHaveBeenCalledTimes(0)
    })

    it('calls output with params', async () => {
      const spy = vitest.spyOn(gravityClient, 'monitorSession')
      const webVitalsHandler = new WebVitalsHandler(sessionIdHandler, trackingHandler, gravityClient)
      webVitalsHandler.flush(metric)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(sessionId, {
        location: location(),
        metric,
      })
    })
  })
})
