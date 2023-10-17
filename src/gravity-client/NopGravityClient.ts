import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  GravityMetric,
  IdentifySessionResponse,
  MonitorSessionResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
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

  async handleScreenRecords(
    sessionId: string,
    screenRecords: ReadonlyArray<eventWithTime>,
  ): Promise<AddSessionRecordingResponse> {
    return { error: null }
  }

  async handleSessionMetrics(sessionId: string, metric: ReadonlyArray<GravityMetric>): Promise<MonitorSessionResponse> {
    return { error: null }
  }
}
