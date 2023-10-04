import { AddSessionUserActionsResponse, IdentifySessionResponse, SessionTraits, SessionUserAction } from '../types'
import { IGravityClient } from './IGravityClient'
import { DataBuffering } from './DataBuffering'

export interface SessionTraitsWithSessionId {
  sessionId: string
  sessionTraits: SessionTraits
}

export abstract class AbstractGravityClient implements IGravityClient {
  private readonly sessionUserActionBuffer: DataBuffering<SessionUserAction, AddSessionUserActionsResponse>
  private readonly sessionTraitsBuffer: DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>
  private readonly screenRecordBuffer: DataBuffering<unknown, void>

  constructor(requestInterval: number, onPublish?: (userActions: ReadonlyArray<SessionUserAction>) => void) {
    this.sessionUserActionBuffer = new DataBuffering<SessionUserAction, AddSessionUserActionsResponse>({
      handleInterval: requestInterval,
      handleData: this.handleSessionUserActions.bind(this),
      onFlush: onPublish,
    })
    this.sessionTraitsBuffer = new DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>({
      handleInterval: requestInterval,
      handleData: async (sessionTraitsWithSessionIds) => {
        const { sessionId, sessionTraits } = this.extractSessionIdAndSessionTraits(sessionTraitsWithSessionIds)
        return await this.handleSessionTraits(sessionId, sessionTraits)
      },
    })
    this.screenRecordBuffer = new DataBuffering<unknown, void>({
      handleInterval: requestInterval,
      handleData: this.handleScreenRecords.bind(this),
    })
  }

  async addSessionUserAction(sessionUserAction: SessionUserAction) {
    await this.sessionUserActionBuffer.addData(sessionUserAction)
  }

  async addScreenRecord(screenRecord: unknown) {
    await this.screenRecordBuffer.addData(screenRecord)
  }

  async identifySession(sessionId: string, sessionTraits: SessionTraits) {
    await this.sessionTraitsBuffer.addData({
      sessionId,
      sessionTraits,
    })
  }

  async flush() {
    await this.sessionUserActionBuffer.flush()
    await this.sessionTraitsBuffer.flush()
  }

  protected abstract handleSessionUserActions(
    sessionUserActions: ReadonlyArray<SessionUserAction>,
  ): Promise<AddSessionUserActionsResponse>

  protected abstract handleSessionTraits(
    sessionId: string,
    sessionTraits: SessionTraits,
  ): Promise<IdentifySessionResponse>

  protected abstract handleScreenRecords(screenRecordings: ReadonlyArray<unknown>): Promise<void>

  private extractSessionIdAndSessionTraits(
    sessionTraitsWithSessionIds: ReadonlyArray<SessionTraitsWithSessionId>,
  ): SessionTraitsWithSessionId {
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
    return { sessionId, sessionTraits }
  }
}
