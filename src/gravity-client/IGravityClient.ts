import { SessionTraits, SessionUserAction } from '../types'
import { IdentifySessionResponse } from '../session-trait/sessionTraitSender'

export interface IGravityClient {
  addSessionUserAction: (sessionId: string, sessionUserAction: SessionUserAction) => Promise<void>
  identifySession: (sessionId: string, sessionTraits: SessionTraits) => Promise<IdentifySessionResponse>
}
