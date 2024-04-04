import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  AddSnapshotResponse,
  DocumentSnapshot,
  IdentifySessionResponse,
  GravityRecordingSettingsResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import AbstractGravityClient, { GravityClientOptions } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import { eventWithTime } from '@rrweb/types'

export default class NopGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(options: GravityClientOptions, recordingSettingsDispatcher = new RecordingSettingsDispatcher()) {
    super(options, recordingSettingsDispatcher)
  }

  async handleSessionUserActions(
    sessionUserActions: readonly SessionUserAction[],
  ): Promise<AddSessionUserActionsResponse> {
    return { error: null }
  }

  async handleSessionTraits(sessionId: string, sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
    return { error: null }
  }

  async handleVideoRecords(
    sessionId: string,
    screenRecords: ReadonlyArray<eventWithTime>,
  ): Promise<AddSessionRecordingResponse> {
    return { error: null }
  }

  async handleSnapshots(sessionId: string, snapshots: ReadonlyArray<DocumentSnapshot>): Promise<AddSnapshotResponse> {
    return { error: null }
  }

  async readSessionCollectionSettings(): Promise<GravityRecordingSettingsResponse> {
    return { error: null, settings: null }
  }
}
