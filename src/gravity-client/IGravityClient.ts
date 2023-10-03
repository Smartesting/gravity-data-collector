import { SessionTraits, SessionUserAction } from '../types'

export interface IGravityClient {
  addSessionUserAction: (sessionUserAction: SessionUserAction) => Promise<void>
  identifySession: (sessionId: string, sessionTraits: SessionTraits) => Promise<void>
}
