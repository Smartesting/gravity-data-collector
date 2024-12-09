import {
  AddPageConsumptionsResponse,
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  GravityRecordingSettingsResponse,
  IdentifySessionResponse,
} from '../types'
import AbstractGravityClient, { GravityClientOptions } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import { nop } from '../utils/nop'

export default class NopGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(options: GravityClientOptions, recordingSettingsDispatcher = new RecordingSettingsDispatcher(nop)) {
    super(options, recordingSettingsDispatcher, nop)
  }

  async handleSessionUserActions(): Promise<AddSessionUserActionsResponse> {
    return { error: null }
  }

  async handlePageConsumptions(): Promise<AddPageConsumptionsResponse> {
    return { error: null }
  }

  async handleSessionTraits(): Promise<IdentifySessionResponse> {
    return { error: null }
  }

  async handleVideoRecords(): Promise<AddSessionRecordingResponse> {
    return { error: null }
  }

  async readSessionCollectionSettings(): Promise<GravityRecordingSettingsResponse> {
    return { error: null, settings: null }
  }
}
