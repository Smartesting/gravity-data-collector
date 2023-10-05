import { SessionTraits, SessionUserAction } from '../types'
import { eventWithTime } from '@rrweb/types'

export interface IGravityClient {
  addSessionUserAction: (sessionUserAction: SessionUserAction) => Promise<void>
  addScreenRecord: (screenRecord: eventWithTime) => Promise<void>
  identifySession: (sessionId: string, sessionTraits: SessionTraits) => Promise<void>
  flush: () => void
}
