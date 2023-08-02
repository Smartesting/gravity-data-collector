import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import WebVitalsHandler from './WebVitalsHandler'
import MemorySessionIdHandler from '../session-id-handler/MemorySessionIdHandler'
import { Metric } from 'web-vitals'
import TrackingHandler from '../tracking-handler/TrackingHandler'
import EventListenersHandler from '../event-listeners-handler/EventListenersHandler'
import { mockWindowLocation } from '../test-utils/mocks'
import location from '../utils/location'

describe('WebVitalsHandler', () => {
  describe('handle', () => {
    const output = vitest.fn()
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

    beforeEach(() => {
      window.sessionStorage.clear()
      mockWindowLocation()
      vi.useFakeTimers()
      vi.restoreAllMocks()
      trackingHandler = new TrackingHandler([])
      trackingHandler.init(new EventListenersHandler([]))
    })

    it('does not call output if tracking is disabled', async () => {
      const webVitalsHandler = new WebVitalsHandler(sessionIdHandler, trackingHandler, output)
      trackingHandler.deactivateTracking()
      webVitalsHandler.flush(metric)
      expect(output).toHaveBeenCalledTimes(0)
    })

    it('calls output with params', async () => {
      const webVitalsHandler = new WebVitalsHandler(sessionIdHandler, trackingHandler, output)
      webVitalsHandler.flush(metric)
      expect(output).toHaveBeenCalledTimes(1)
      expect(output).toHaveBeenCalledWith(sessionId, { location: location(), metric })
    })
  })
})
