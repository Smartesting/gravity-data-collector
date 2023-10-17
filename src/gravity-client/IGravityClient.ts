import { GravityMetric, SessionTraits, SessionUserAction } from '../types'
import { eventWithTime } from '@rrweb/types'

export interface IGravityClient {
  addSessionUserAction: (sessionUserAction: SessionUserAction) => Promise<void>
  addScreenRecord: (sessionId: string, screenRecord: eventWithTime) => Promise<void>
  identifySession: (sessionId: string, sessionTraits: SessionTraits) => Promise<void>
  monitorSession: (sessionId: string, metric: GravityMetric) => Promise<void>
  flush: () => void
}
