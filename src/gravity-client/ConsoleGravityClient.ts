import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  IdentifySessionResponse,
  ReadSessionCollectionSettingsResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import AbstractGravityClient, { GravityClientOptions } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { eventWithTime } from '@rrweb/types'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'

type ConsoleGravityClientOptions = GravityClientOptions & {
  maxDelay?: number
  enableLogging?: boolean
}

export default class ConsoleGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(
    private readonly options: ConsoleGravityClientOptions,
    recordingSettingsDispatcher: RecordingSettingsDispatcher,
  ) {
    super(options, recordingSettingsDispatcher)
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
    this.log({
      sessionId,
      screenRecords,
    })
    return { error: null }
  }

  async readSessionCollectionSettings(): Promise<ReadSessionCollectionSettingsResponse> {
    return {
      settings: null,
      error: null,
    }
  }

  private log(data: unknown) {
    if (this.options.enableLogging === false) return
    const maxDelay = this.options.maxDelay ?? 0
    if (maxDelay > 0) {
      setTimeout(() => {
        console.log(data)
      }, maxDelay * Math.random())
    } else {
      console.log(data)
    }
  }
}
