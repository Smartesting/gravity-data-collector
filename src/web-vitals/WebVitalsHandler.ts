import { Metric, onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import TrackingHandler from '../tracking-handler/TrackingHandler'
import location from '../utils/location'
import { GravityMetric } from '../types'

export default class WebVitalsHandler {
  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly trackingHandler: TrackingHandler,
    private readonly output: (sessionId: string, metric: GravityMetric) => void,
  ) {}

  init() {
    try {
      const flushBind = this.flush.bind(this)
      onFID(flushBind)
      onTTFB(flushBind)
      onLCP(flushBind)
      onCLS(flushBind)
      onFCP(flushBind)
      onINP(flushBind)
    } catch (e) {
      console.error('Unable to initialize WebVitalsHandler', { e })
    }
  }

  flush(metric: Metric) {
    if (this.trackingHandler.isTracking()) {
      this.output(this.sessionIdHandler.get(), {
        location: location(),
        metric,
      })
    }
  }
}
