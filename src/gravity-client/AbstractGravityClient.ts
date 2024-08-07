import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  GravityRecordingSettingsResponse,
  IdentifySessionResponse,
  Logger,
  SessionTraits,
  SessionUserAction,
} from '../types'
import { IGravityClient } from './IGravityClient'
import { DataBuffering } from './DataBuffering'
import { eventWithTime } from '@smartesting/rrweb-types'
import RecordingSettingsDispatcher from './RecordingSettingsDispatcher'
import isDefined from '../utils/isDefined'

export interface SessionTraitsWithSessionId {
  sessionId: string
  sessionTraits: SessionTraits
}

export interface ScreenRecordWithSessionId {
  sessionId: string
  screenRecord: eventWithTime
}

export interface ScreenRecordsWithSessionId {
  sessionId: string
  screenRecords: ReadonlyArray<eventWithTime>
}

export interface GravityClientOptions {
  requestInterval: number
  onPublish?: (userActions: ReadonlyArray<SessionUserAction>) => void
}

export default abstract class AbstractGravityClient implements IGravityClient {
  private readonly sessionUserActionBuffer: DataBuffering<SessionUserAction, AddSessionUserActionsResponse>
  private readonly sessionTraitsBuffer: DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>
  private readonly videoBuffer: DataBuffering<ScreenRecordWithSessionId, AddSessionRecordingResponse>

  protected constructor(
    options: GravityClientOptions,
    recordingSettingsDispatcher: RecordingSettingsDispatcher,
    logger: Logger,
  ) {
    this.sessionUserActionBuffer = new DataBuffering<SessionUserAction, AddSessionUserActionsResponse>({
      handleInterval: options.requestInterval,
      handleData: async (sessionUserActions) => {
        const response = await this.handleSessionUserActions(sessionUserActions)
        logger(`send ${sessionUserActions.length} user actions`, { response })
        return response
      },
      onFlush: (buffer, response) => {
        options.onPublish?.(buffer)
        if (!isDefined(response.error)) {
          this.videoBuffer.unlock()
          this.sessionTraitsBuffer.unlock()
        }
      },
    })
    this.sessionTraitsBuffer = new DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>({
      handleInterval: options.requestInterval,
      handleData: async (sessionTraitsWithSessionIds) => {
        const { sessionId, sessionTraits } = this.extractSessionIdAndSessionTraits(sessionTraitsWithSessionIds)
        const response = await this.handleSessionTraits(sessionId, sessionTraits)
        logger('send traits', { response })
        return response
      },
      locked: true,
    })
    this.videoBuffer = new DataBuffering<ScreenRecordWithSessionId, AddSessionRecordingResponse>({
      handleInterval: options.requestInterval,
      handleData: async (screenRecordsWithSessionIds) => {
        const { sessionId, screenRecords } = this.extractSessionIdAndScreenRecords(screenRecordsWithSessionIds)
        const response = await this.handleVideoRecords(sessionId, screenRecords)
        logger(`send ${screenRecords.length} video events`, { response })
        return response
      },
      locked: true,
    })
    recordingSettingsDispatcher.subscribe(({ sessionRecording, videoRecording }) => {
      if (sessionRecording) {
        this.sessionUserActionBuffer.activate()
        this.sessionTraitsBuffer.activate()
      }
      if (videoRecording) {
        this.videoBuffer.activate()
      }
    })
  }

  reset() {
    this.sessionTraitsBuffer.lock()
    this.videoBuffer.lock()
  }

  async addSessionUserAction(sessionUserAction: SessionUserAction) {
    await this.sessionUserActionBuffer.addData(sessionUserAction)
  }

  async addScreenRecord(sessionId: string, screenRecord: eventWithTime) {
    await this.videoBuffer.addData({
      sessionId,
      screenRecord,
    })
  }

  async identifySession(sessionId: string, sessionTraits: SessionTraits) {
    await this.sessionTraitsBuffer.addData({
      sessionId,
      sessionTraits,
    })
  }

  async flush(): Promise<void> {
    await Promise.all([
      this.sessionUserActionBuffer.flush(),
      this.videoBuffer.flush(),
      this.sessionTraitsBuffer.flush(),
    ])
  }

  abstract readSessionCollectionSettings(): Promise<GravityRecordingSettingsResponse>

  protected abstract handleSessionUserActions(
    sessionUserActions: ReadonlyArray<SessionUserAction>,
  ): Promise<AddSessionUserActionsResponse>

  protected abstract handleSessionTraits(
    sessionId: string,
    sessionTraits: SessionTraits,
  ): Promise<IdentifySessionResponse>

  protected abstract handleVideoRecords(
    sessionId: string,
    screenRecords: ReadonlyArray<eventWithTime>,
  ): Promise<AddSessionRecordingResponse>

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
    return {
      sessionId,
      sessionTraits,
    }
  }

  private extractSessionIdAndScreenRecords(
    screenRecordsWithSessionIds: ReadonlyArray<ScreenRecordWithSessionId>,
  ): ScreenRecordsWithSessionId {
    const sessionId = screenRecordsWithSessionIds[0]?.sessionId
    if (sessionId === undefined) {
      throw new Error('No session id')
    }

    const screenRecords: eventWithTime[] = []
    for (const screenRecordWithSessionId of screenRecordsWithSessionIds) {
      if (sessionId === screenRecordWithSessionId.sessionId) {
        screenRecords.push(screenRecordWithSessionId.screenRecord)
      }
    }
    return {
      sessionId,
      screenRecords,
    }
  }
}
