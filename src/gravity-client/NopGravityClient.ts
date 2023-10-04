import { SessionTraits, SessionUserAction, AddSessionUserActionsResponse, IdentifySessionResponse } from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'

export default class NopGravityClient extends AbstractGravityClient implements IGravityClient {
    async handleSessionUserActions(
        sessionUserActions: readonly SessionUserAction[],
    ): Promise<AddSessionUserActionsResponse> {
        return { error: null }
    }

    async handleSessionTraits(sessionId: string, sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
        return { error: null }
    }
}
