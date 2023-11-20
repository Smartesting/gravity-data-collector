import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  IdentifySessionResponse,
  ReadSessionCollectionSettingsResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import { AbstractGravityClient, GravityClientOptions } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import crossfetch from 'cross-fetch'
import {
  buildGravityTrackingIdentifySessionApiUrl,
  buildGravityTrackingPublishApiUrl,
  buildGravityTrackingSessionCollectionSettingsApiUrl,
  buildGravityTrackingSessionRecordingApiUrl,
} from '../gravityEndPoints'
import { eventWithTime } from '@rrweb/types'
import { RecordingSettingsDispatcher } from './RecordingSettingsDispatcher'
import { config } from '../config'

type HttpGravityClientOptions = GravityClientOptions & {
  authKey: string
  gravityServerUrl: string
}

export default class HttpGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(
    private readonly options: HttpGravityClientOptions,
    private readonly recordingSettingsDispatcher: RecordingSettingsDispatcher,
    private readonly fetch = crossfetch,
  ) {
    super(options, recordingSettingsDispatcher)
  }

  async handleSessionUserActions(
    sessionUserActions: readonly SessionUserAction[],
  ): Promise<AddSessionUserActionsResponse> {
    return await this.sendRequest<AddSessionUserActionsResponse>(
      buildGravityTrackingPublishApiUrl(this.options.authKey, this.options.gravityServerUrl),
      sessionUserActions,
    )
  }

  async handleSessionTraits(sessionId: string, sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
    return await this.sendRequest<IdentifySessionResponse>(
      buildGravityTrackingIdentifySessionApiUrl(this.options.authKey, this.options.gravityServerUrl, sessionId),
      sessionTraits,
    )
  }

  async handleScreenRecords(
    sessionId: string,
    screenRecords: ReadonlyArray<eventWithTime>,
  ): Promise<AddSessionRecordingResponse> {
    const screenRecordsNdjson = screenRecords.map((screenRecord) => JSON.stringify(screenRecord)).join('\n') + '\n'
    const response = await this.fetch(
      buildGravityTrackingSessionRecordingApiUrl(this.options.authKey, this.options.gravityServerUrl, sessionId),
      {
        method: 'POST',
        redirect: 'follow',
        body: screenRecordsNdjson,
        headers: {
          'Content-Type': 'application/x-ndjson',
        },
      },
    )
    const responseBody: AddSessionRecordingResponse = await response.json()
    this.handleResponseStatus(response.status)

    return responseBody
  }

  async readSessionCollectionSettings(): Promise<ReadSessionCollectionSettingsResponse> {
    const response = await this.fetch(
      buildGravityTrackingSessionCollectionSettingsApiUrl(this.options.authKey, this.options.gravityServerUrl),
      {
        method: 'GET',
        redirect: 'follow',
      },
    )
    const responseBody: ReadSessionCollectionSettingsResponse = await response.json()
    this.handleResponseStatus(response.status)
    return responseBody
  }

  private handleResponseStatus(statusCode: number) {
    if (config.ERRORS_TERMINATE_TRACKING.includes(statusCode)) {
      this.recordingSettingsDispatcher.terminate()
    }
  }

  private async sendRequest<T extends { error: string | null }>(url: string, body: unknown): Promise<T> {
    const response = await this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const responseBody: T = await response.json()
    this.handleResponseStatus(response.status)

    return responseBody
  }
}
