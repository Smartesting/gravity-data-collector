import { AddSessionUserActionsResponse, IdentifySessionResponse, SessionTraits, SessionUserAction } from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import crossfetch from 'cross-fetch'
import { buildGravityTrackingIdentifySessionApiUrl, buildGravityTrackingPublishApiUrl } from '../gravityEndPoints'
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

  async handleScreenRecords(screenRecords: ReadonlyArray<eventWithTime>): Promise<void> {
    console.log({ screenRecords })
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
