import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  IdentifySessionResponse,
  ReadSessionCollectionSettingsResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import AbstractGravityClient from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { eventWithTime } from '@rrweb/types'
import { RecordingSettingsDispatcher } from './RecordingSettingsDispatcher'

export default class NopGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(requestInterval: number) {
    super({ requestInterval }, new RecordingSettingsDispatcher())
  }

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

  async readSessionCollectionSettings(): Promise<ReadSessionCollectionSettingsResponse> {
    return { error: null, settings: null }
  }
}
