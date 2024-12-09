import {
  AddPageConsumptionsResponse,
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  GravityRecordingSettingsResponse,
  IdentifySessionResponse,
  Logger,
  PageConsumption,
  SessionTraits,
  SessionUserAction,
} from '../types'
import AbstractGravityClient, { GravityClientOptions } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import crossfetch from 'cross-fetch'
import {
  buildGravityTrackingConsumptionApiUrl,
  buildGravityTrackingIdentifySessionApiUrl,
  buildGravityTrackingPublishApiUrl,
  buildGravityTrackingSessionCollectionSettingsApiUrl,
  buildGravityTrackingSessionRecordingApiUrl,
} from '../gravityEndPoints'
import { eventWithTime } from '@smartesting/rrweb-types'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import { config } from '../config'

type HttpGravityClientOptions = GravityClientOptions & {
  authKey: string
  gravityServerUrl: string
}

export default class HttpGravityClient extends AbstractGravityClient implements IGravityClient {
  constructor(
    private readonly options: HttpGravityClientOptions,
    private readonly recordingSettingsDispatcher: RecordingSettingsDispatcher,
    logger: Logger,
    private readonly fetch = crossfetch,
    private collectorApiUrl: string = options.gravityServerUrl,
  ) {
    super(options, recordingSettingsDispatcher, logger)
    recordingSettingsDispatcher.subscribe(({ collectorApiUrl }) => {
      if (collectorApiUrl) this.collectorApiUrl = collectorApiUrl
    })
  }

  async handleSessionUserActions(
    sessionUserActions: readonly SessionUserAction[],
  ): Promise<AddSessionUserActionsResponse> {
    return await this.sendRequest<AddSessionUserActionsResponse>(
      buildGravityTrackingPublishApiUrl(this.options.authKey, this.collectorApiUrl),
      sessionUserActions,
    )
  }

  async handlePageConsumptions(
    pageConsumptions: readonly PageConsumption[],
  ): Promise<AddPageConsumptionsResponse> {
    return await this.sendRequest<AddPageConsumptionsResponse>(
      buildGravityTrackingConsumptionApiUrl(this.options.authKey, this.collectorApiUrl),
      pageConsumptions,
    )
  }

  async handleSessionTraits(sessionId: string, sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
    return await this.sendRequest<IdentifySessionResponse>(
      buildGravityTrackingIdentifySessionApiUrl(this.options.authKey, this.collectorApiUrl, sessionId),
      sessionTraits,
    )
  }

  async handleVideoRecords(
    sessionId: string,
    records: ReadonlyArray<eventWithTime>,
  ): Promise<AddSessionRecordingResponse> {
    const screenRecordsNdjson = records.map((record) => JSON.stringify(record)).join('\n') + '\n'
    const response = await this.fetch(
      buildGravityTrackingSessionRecordingApiUrl(this.options.authKey, this.collectorApiUrl, sessionId),
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

  async readSessionCollectionSettings(): Promise<GravityRecordingSettingsResponse> {
    const response = await this.fetch(
      buildGravityTrackingSessionCollectionSettingsApiUrl(this.options.authKey, this.options.gravityServerUrl),
      {
        method: 'GET',
        redirect: 'follow',
      },
    )
    const responseBody: GravityRecordingSettingsResponse = await response.json()
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
