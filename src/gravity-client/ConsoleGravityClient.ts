import {
  AddPageConsumptionsResponse,
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  GravityRecordingSettingsResponse,
  IdentifySessionResponse,
  PageConsumption,
  SessionTraits,
  SessionUserAction,
} from '../types'
import AbstractGravityClient, { GravityClientOptions } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { eventWithTime } from '@smartesting/rrweb-types'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'

type ConsoleGravityClientOptions = GravityClientOptions & {
  maxDelay?: number
}

export default class ConsoleGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(
    private readonly options: ConsoleGravityClientOptions,
    recordingSettingsDispatcher: RecordingSettingsDispatcher,
  ) {
    super(options, recordingSettingsDispatcher, console.log)
  }

  async handleSessionUserActions(
    sessionUserActions: ReadonlyArray<SessionUserAction>,
  ): Promise<AddSessionUserActionsResponse> {
    this.log({ sessionUserActions })
    return { error: null }
  }

  async handlePageConsumptions(
    pageConsumptions: ReadonlyArray<PageConsumption>,
  ): Promise<AddPageConsumptionsResponse> {
    this.log({ pageConsumptions })
    return { error: null }
  }

  async handleSessionTraits(sessionId: string, sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
    this.log({ sessionId, sessionTraits })
    return { error: null }
  }

  async handleVideoRecords(
    sessionId: string,
    screenRecords: ReadonlyArray<eventWithTime>,
  ): Promise<AddSessionRecordingResponse> {
    this.log({ sessionId, screenRecords })
    return { error: null }
  }

  async readSessionCollectionSettings(): Promise<GravityRecordingSettingsResponse> {
    return {
      settings: {
        sessionRecording: true,
        videoRecording: true,
      },
      error: null,
    }
  }

  private log(data: unknown) {
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
