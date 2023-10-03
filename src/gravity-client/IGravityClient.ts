import { SessionTraits, SessionUserAction } from '../types'

export interface IGravityClient {
  addSessionUserAction: (sessionId: string, sessionUserAction: SessionUserAction) => Promise<void>
  identifySession: (sessionId: string, sessionTraits: SessionTraits) => Promise<void>
}
