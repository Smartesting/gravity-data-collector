import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  CollectorOptions,
  IdentifySessionResponse,
  ReadSessionCollectionSettingsResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import { IGravityClient } from './IGravityClient'
import { DataBuffering } from './DataBuffering'
import { eventWithTime } from '@rrweb/types'
import { RecordingSettingsDispatcher } from './RecordingSettingsDispatcher'

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

export type RecordingSettings = Pick<CollectorOptions, 'enableEventRecording' | 'enableVideoRecording'>

export abstract class AbstractGravityClient implements IGravityClient {
  private readonly sessionUserActionBuffer: DataBuffering<SessionUserAction, AddSessionUserActionsResponse>
  private readonly sessionTraitsBuffer: DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>
  private readonly screenRecordBuffer: DataBuffering<ScreenRecordWithSessionId, AddSessionRecordingResponse>

  protected constructor(options: GravityClientOptions, recordingSettingsDispatcher: RecordingSettingsDispatcher) {
    this.sessionUserActionBuffer = new DataBuffering<SessionUserAction, AddSessionUserActionsResponse>({
      handleInterval: options.requestInterval,
      handleData: this.handleSessionUserActions.bind(this),
      onFlush: (buffer, response) => {
        options.onPublish?.(buffer)
        if (response.error === null) {
          this.screenRecordBuffer.unlock()
          this.sessionTraitsBuffer.unlock()
        }
      },
    })
    this.sessionTraitsBuffer = new DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>({
      handleInterval: options.requestInterval,
      handleData: async (sessionTraitsWithSessionIds) => {
        const { sessionId, sessionTraits } = this.extractSessionIdAndSessionTraits(sessionTraitsWithSessionIds)
        return await this.handleSessionTraits(sessionId, sessionTraits)
      },
      locked: true,
    })
    this.screenRecordBuffer = new DataBuffering<ScreenRecordWithSessionId, AddSessionRecordingResponse>({
      handleInterval: options.requestInterval,
      handleData: async (screenRecordsWithSessionIds) => {
        const { sessionId, screenRecords } = this.extractSessionIdAndScreenRecords(screenRecordsWithSessionIds)
        return await this.handleScreenRecords(sessionId, screenRecords)
      },
      locked: true,
    })
    recordingSettingsDispatcher.subscribe(({ enableEventRecording, enableVideoRecording }) => {
      if (enableEventRecording) {
        this.sessionUserActionBuffer.activate()
        this.sessionTraitsBuffer.activate()
      }
      if (enableVideoRecording) {
        this.screenRecordBuffer.activate()
      }
    })
  }

  async addSessionUserAction(sessionUserAction: SessionUserAction) {
    await this.sessionUserActionBuffer.addData(sessionUserAction)
  }

  async addScreenRecord(sessionId: string, screenRecord: eventWithTime) {
    await this.screenRecordBuffer.addData({
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

  async flush() {
    return await Promise.all([
      this.sessionUserActionBuffer.flush(),
      this.screenRecordBuffer.flush(),
      this.sessionTraitsBuffer.flush(),
    ])
  }

  abstract readSessionCollectionSettings(): Promise<ReadSessionCollectionSettingsResponse>

  protected abstract handleSessionUserActions(
    sessionUserActions: ReadonlyArray<SessionUserAction>,
  ): Promise<AddSessionUserActionsResponse>

  protected abstract handleSessionTraits(
    sessionId: string,
    sessionTraits: SessionTraits,
  ): Promise<IdentifySessionResponse>

  protected abstract handleScreenRecords(
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
