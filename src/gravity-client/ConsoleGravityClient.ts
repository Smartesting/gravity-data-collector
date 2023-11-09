import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  IdentifySessionResponse,
  ReadSessionCollectionSettingsResponse,
  SessionCollectionSettings,
  SessionTraits,
  SessionUserAction,
} from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { eventWithTime } from '@rrweb/types'

export const DEFAULT_SESSION_COLLECTION_SETTINGS: SessionCollectionSettings = {
  sessionRecording: true,
  videoRecording: true,
}

export default class ConsoleGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(requestInterval: number, private readonly maxDelay: number = 0) {
    super(requestInterval)
  }

  async handleSessionUserActions(
    sessionUserActions: ReadonlyArray<SessionUserAction>,
  ): Promise<AddSessionUserActionsResponse> {
    this.log({ sessionUserActions })
    return { error: null }
  }

  async handleSessionTraits(sessionId: string, sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
    this.log({ sessionId, sessionTraits })
    return { error: null }
  }

  async handleScreenRecords(
    sessionId: string,
    screenRecords: ReadonlyArray<eventWithTime>,
  ): Promise<AddSessionRecordingResponse> {
    this.log({ sessionId, screenRecords })
    return { error: null }
  }

  async readSessionCollectionSettings(): Promise<ReadSessionCollectionSettingsResponse> {
    return {
      settings: DEFAULT_SESSION_COLLECTION_SETTINGS,
      error: null,
    }
  }

  private log(data: unknown) {
    if (this.maxDelay > 0) {
      setTimeout(() => {
        console.log(data)
      }, this.maxDelay * Math.random())
    } else {
      console.log(data)
    }
  }
}
