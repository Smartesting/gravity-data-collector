import { SessionTraits, SessionUserAction } from '../types'
import { IdentifySessionResponse } from '../session-trait/sessionTraitSender'
import { IGravityClient } from './IGravityClient'
import { DataBuffering } from './DataBuffering'
import { AddSessionUserActionsResponse } from '../user-action/sessionUserActionSender'

interface SessionTraitsWithSessionId {
  sessionId: string
  sessionTraits: SessionTraits
}

export abstract class AbstractGravityClient implements IGravityClient {
  private readonly sessionUserActionBuffer: DataBuffering<SessionUserAction, AddSessionUserActionsResponse>
  private readonly sessionTraitsBuffer: DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>

  protected constructor(requestInterval: number) {
    this.sessionUserActionBuffer = new DataBuffering<SessionUserAction, AddSessionUserActionsResponse>({
      handleInterval: requestInterval,
      handleData: this.handleSessionUserActions,
    })
    this.sessionTraitsBuffer = new DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>({
      handleInterval: requestInterval,
      handleData: this.handleSessionTraits,
    })
  }

  async addSessionUserAction(sessionUserAction: SessionUserAction) {
    await this.sessionUserActionBuffer.addData(sessionUserAction)
  }

  async identifySession(sessionId: string, sessionTraits: SessionTraits): Promise<void> {
    await this.sessionTraitsBuffer.addData({ sessionId, sessionTraits })
  }

  protected abstract handleSessionUserActions(
    sessionUserActions: ReadonlyArray<SessionUserAction>,
  ): Promise<AddSessionUserActionsResponse>

  protected abstract handleSessionTraits(
    sessionTraits: ReadonlyArray<SessionTraitsWithSessionId>,
  ): Promise<IdentifySessionResponse>
}
