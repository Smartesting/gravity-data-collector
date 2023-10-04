import { SessionTraits, SessionUserAction } from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { AddSessionUserActionsResponse } from '../user-action/sessionUserActionSender'
import { IdentifySessionResponse } from '../session-trait/sessionTraitSender'
import crossfetch from 'cross-fetch'
import { buildGravityTrackingIdentifySessionApiUrl, buildGravityTrackingPublishApiUrl } from '../gravityEndPoints'

interface HttpGravityClientOptions {
  authKey: string
  gravityServerUrl: string
  onPublish?: (userActions: ReadonlyArray<SessionUserAction>) => void
  onError?: (status: number, message: string) => void
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
      const { responseBody: addSessionUserActionsResponse, status } = await this.sendRequest<AddSessionUserActionsResponse>(
          buildGravityTrackingPublishApiUrl(this.options.authKey, this.options.gravityServerUrl),
          sessionUserActions,
      )

    if (status !== 200) {
      // TODO: handle error case
    }
    return addSessionUserActionsResponse
  }

  async handleSessionTraits(
      sessionId: string,
      sessionTraits: SessionTraits,
  ): Promise<IdentifySessionResponse> {
      const { responseBody: identifySessionResponse, status } = await this.sendRequest<IdentifySessionResponse>(
          buildGravityTrackingIdentifySessionApiUrl(this.options.authKey, this.options.gravityServerUrl, sessionId),
          sessionTraits,
      )
    if (status !== 200) {
      // TODO: handle error case
    }
    return identifySessionResponse
  }

  private async sendRequest<T>(url: string, body: unknown): Promise<{responseBody: T, status: number}> {
      const response = await this.fetch(
          url,
          {
              method: 'POST',
              body: JSON.stringify(body),
              redirect: 'follow',
              headers: {
                  'Content-Type': 'application/json',
              },
          },
      )
      const responseBody: T = await response.json()
      return { responseBody, status: response.status }
  }
}
