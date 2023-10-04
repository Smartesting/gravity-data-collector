import { SessionTraits, SessionUserAction } from '../types'

export interface IGravityClient {
  addSessionUserAction: (sessionUserAction: SessionUserAction) => Promise<void>
  addScreenRecord: (screenRecord: unknown) => Promise<void>
  identifySession: (sessionId: string, sessionTraits: SessionTraits) => Promise<void>
  flush: () => void
}
