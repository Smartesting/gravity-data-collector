import { SessionTraits, SessionUserAction } from '../types'
import { AbstractGravityClient, SessionTraitsWithSessionId } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { AddSessionUserActionsResponse } from '../user-action/sessionUserActionSender'
import { IdentifySessionResponse } from '../session-trait/sessionTraitSender'
import crossfetch from 'cross-fetch'
import { buildGravityTrackingIdentifySessionApiUrl, buildGravityTrackingPublishApiUrl } from '../gravityEndPoints'

interface HttpGravityClientOptions {
  authKey: string
  gravityServerUrl: string
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
    const response = await this.fetch(
      buildGravityTrackingPublishApiUrl(this.options.authKey, this.options.gravityServerUrl),
      {
        method: 'POST',
        body: JSON.stringify(sessionUserActions),
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    const addSessionUserActionsResponse = await response.json()
    if (response.status !== 200) {
      // TODO: handle error case
    }
    return addSessionUserActionsResponse
  }

  async handleSessionTraits(
    sessionTraitsWithSessionIds: readonly SessionTraitsWithSessionId[],
  ): Promise<IdentifySessionResponse> {
    const sessionId = sessionTraitsWithSessionIds[0]?.sessionId
    if (sessionId === undefined) {
      throw new Error('No session id')
    }

    let sessionTraits: SessionTraits = {}
    for (const sessionTraitWithSessionId of sessionTraitsWithSessionIds) {
      if (sessionId === sessionTraitWithSessionId.sessionId) {
        sessionTraits = { ...sessionTraits, ...sessionTraitWithSessionId.sessionTraits }
      }
    }

    const response = await this.fetch(
      buildGravityTrackingIdentifySessionApiUrl(this.options.authKey, this.options.gravityServerUrl, sessionId),
      {
        method: 'POST',
        body: JSON.stringify(sessionTraits),
        redirect: 'follow',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    const identifySessionResponse: IdentifySessionResponse = await response.json()
    if (response.status !== 200) {
      // TODO: handle error case
    }
    return identifySessionResponse
  }
}
