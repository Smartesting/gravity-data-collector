import { GravityRecordingSettingsResponse, PageConsumption, SessionTraits, SessionUserAction } from '../types'
import { eventWithTime } from '@smartesting/rrweb-types'

export interface IGravityClient {
  addSessionUserAction: (sessionUserAction: SessionUserAction) => Promise<void>

  addPageConsumption: (pageConsumption: PageConsumption) => Promise<void>

  addScreenRecord: (sessionId: string, screenRecord: eventWithTime) => Promise<void>

  identifySession: (sessionId: string, sessionTraits: SessionTraits) => Promise<void>

  readSessionCollectionSettings: () => Promise<GravityRecordingSettingsResponse>

  flush: () => Promise<void>

  reset: () => void
}
