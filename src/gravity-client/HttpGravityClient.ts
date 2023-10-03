import { SessionUserAction } from '../types'
import { AbstractGravityClient, SessionTraitsWithSessionId } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { AddSessionUserActionsResponse } from '../user-action/sessionUserActionSender'
import { IdentifySessionResponse } from '../session-trait/sessionTraitSender'
import crossfetch from 'cross-fetch'
import { buildGravityTrackingPublishApiUrl } from '../gravityEndPoints'

interface HttpGravityClientOptions {
    authKey: string
    gravityServerUrl: string
    source: string | null
}

export default class HttpGravityClient extends AbstractGravityClient implements IGravityClient {
    constructor(
        requestInterval: number,
        private readonly options: HttpGravityClientOptions,
        private readonly fetch = crossfetch,
    ) {
        super(requestInterval)
    }

    async handleSessionUserActions(sessionUserActions: readonly SessionUserAction[]): Promise<AddSessionUserActionsResponse> {
        const response = await this.fetch(buildGravityTrackingPublishApiUrl(this.options.authKey, this.options.gravityServerUrl), {
            method: 'POST',
            body: JSON.stringify(sessionUserActions),
            redirect: 'follow',
            headers: this.headers(),
        })
        const body = await response.json()
        return body as AddSessionUserActionsResponse
    }

    async handleSessionTraits(sessionTraits: readonly SessionTraitsWithSessionId[]): Promise<IdentifySessionResponse> {
        console.log({ sessionTraits })
        return { error: null }
    }

    private headers() {
        const headers: any = {
            'Content-Type': 'application/json',
        }
        if (this.options.source !== null) {
            headers.Origin = this.options.source
        }
        return headers
    }
}
