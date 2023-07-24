import { Metric, onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import TrackingHandler from '../tracking-handler/TrackingHandler'

export default class WebVitalsHandler {
  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly trackingHandler: TrackingHandler,
    private readonly output: (sessionId: string, metric: Metric) => void,
  ) {}

  init() {
    const flushBind = this.flush.bind(this)
    onFID(flushBind)
    onTTFB(flushBind)
    onLCP(flushBind)
    onCLS(flushBind)
    onFCP(flushBind)
    onINP(flushBind)
  }

  flush(metric: Metric) {
    if (this.trackingHandler.isTracking()) {
      this.output(this.sessionIdHandler.get(), metric)
    }
  }
}
