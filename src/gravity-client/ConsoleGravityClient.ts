import { SessionTraits, SessionUserAction } from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'
import { AddSessionUserActionsResponse } from '../user-action/sessionUserActionSender'
import { IdentifySessionResponse } from '../session-trait/sessionTraitSender'

export default class ConsoleGravityClient extends AbstractGravityClient implements IGravityClient {
  async handleSessionUserActions(
    sessionUserActions: ReadonlyArray<SessionUserAction>,
  ): Promise<AddSessionUserActionsResponse> {
    console.log({ sessionUserActions })
    return { error: null }
  }

  async handleSessionTraits(
      sessionId: string,
      sessionTraits: SessionTraits): Promise<IdentifySessionResponse> {
    console.log({ sessionId, sessionTraits })
    return { error: null }
  }
}
