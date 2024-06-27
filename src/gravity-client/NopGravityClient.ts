import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  AddSnapshotResponse,
  DocumentSnapshot,
  GravityRecordingSettingsResponse,
  IdentifySessionResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import AbstractGravityClient, { GravityClientOptions } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import { eventWithTime } from '@smartesting/rrweb-types'
import { nop } from '../utils/nop'

export default class NopGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(options: GravityClientOptions, recordingSettingsDispatcher = new RecordingSettingsDispatcher(nop)) {
    super(options, recordingSettingsDispatcher, nop)
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
