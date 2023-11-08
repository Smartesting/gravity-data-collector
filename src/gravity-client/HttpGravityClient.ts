import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  IdentifySessionResponse,
  ReadSessionCollectionSettingsResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import crossfetch from 'cross-fetch'
import {
  buildGravityTrackingIdentifySessionApiUrl,
  buildGravityTrackingPublishApiUrl,
  buildGravityTrackingSessionCollectionSettingsApiUrl,
  buildGravityTrackingSessionRecordingApiUrl,
} from '../gravityEndPoints'
import { eventWithTime } from '@rrweb/types'

interface HttpGravityClientOptions {
  authKey: string
  gravityServerUrl: string
  onError: (status: number, error: string | null) => void
  onPublish?: (userActions: ReadonlyArray<SessionUserAction>) => void
}

export default class HttpGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(
    requestInterval: number,
    private readonly options: HttpGravityClientOptions,
    private readonly fetch = crossfetch,
  ) {
    super(requestInterval, options.onPublish)
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
    if (response.status !== 200) {
      this.options.onError(response.status, responseBody.error)
    }

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
    if (response.status !== 200) {
      this.options.onError(response.status, responseBody.error)
    }

    return responseBody
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
    if (response.status !== 200) {
      this.options.onError(response.status, responseBody.error)
    }

    return responseBody
  }
}
