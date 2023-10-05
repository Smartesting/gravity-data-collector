import { AddSessionUserActionsResponse, IdentifySessionResponse, SessionTraits, SessionUserAction } from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { eventWithTime } from '@rrweb/types'

export default class NopGravityClient extends AbstractGravityClient implements IGravityClient {
  async handleSessionUserActions(
    sessionUserActions: readonly SessionUserAction[],
  ): Promise<AddSessionUserActionsResponse> {
    return { error: null }
  }

  async handleSessionTraits(sessionId: string, sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
    return { error: null }
  }

  async handleScreenRecords(screenRecordings: ReadonlyArray<eventWithTime>): Promise<void> {}
}
