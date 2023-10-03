import { SessionUserAction } from '../types'
import { AbstractGravityClient, SessionTraitsWithSessionId } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { AddSessionUserActionsResponse } from '../user-action/sessionUserActionSender'
import { IdentifySessionResponse } from '../session-trait/sessionTraitSender'

export default class NopGravityClient extends AbstractGravityClient implements IGravityClient {
    async handleSessionUserActions(
        sessionUserActions: readonly SessionUserAction[],
    ): Promise<AddSessionUserActionsResponse> {
        return { error: null }
    }

    async handleSessionTraits(sessionTraits: readonly SessionTraitsWithSessionId[]): Promise<IdentifySessionResponse> {
        return { error: null }
    }
}
