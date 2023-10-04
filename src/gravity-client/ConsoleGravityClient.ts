import { SessionTraits, SessionUserAction, AddSessionUserActionsResponse, IdentifySessionResponse } from '../types'
import { AbstractGravityClient } from './AbstractGravityClient'
import { IGravityClient } from './IGravityClient'

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

  async handleScreenRecords(screenRecordings: readonly unknown[]): Promise<void> {
    console.log(screenRecordings)
  }
}
