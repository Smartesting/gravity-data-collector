import {
  AddSessionRecordingResponse,
  AddSessionUserActionsResponse,
  GravityMetric,
  IdentifySessionResponse,
  MonitorSessionResponse,
  SessionTraits,
  SessionUserAction,
} from '../types'
import { IGravityClient } from './IGravityClient'
import { DataBuffering } from './DataBuffering'
import { eventWithTime } from '@rrweb/types'

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

export interface SessionMetricWithSessionId {
  sessionId: string
  metric: GravityMetric
}

export interface SessionMetricsWithSessionId {
  sessionId: string
  metrics: ReadonlyArray<GravityMetric>
}

export abstract class AbstractGravityClient implements IGravityClient {
  private readonly sessionUserActionBuffer: DataBuffering<SessionUserAction, AddSessionUserActionsResponse>
  private readonly sessionTraitsBuffer: DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>
  private readonly screenRecordBuffer: DataBuffering<ScreenRecordWithSessionId, AddSessionRecordingResponse>
  private readonly sessionMetricBuffer: DataBuffering<SessionMetricWithSessionId, MonitorSessionResponse>

  constructor(requestInterval: number, onPublish?: (userActions: ReadonlyArray<SessionUserAction>) => void) {
    this.sessionUserActionBuffer = new DataBuffering<SessionUserAction, AddSessionUserActionsResponse>({
      handleInterval: requestInterval,
      handleData: this.handleSessionUserActions.bind(this),
      onFlush: (buffer, response) => {
        onPublish?.(buffer)
        if (!this.screenRecordBuffer.getIsFlushingAllowed() && response.error === null) {
          this.screenRecordBuffer.setIsFlushingAllowed(true)
        }
      },
    })
    this.sessionTraitsBuffer = new DataBuffering<SessionTraitsWithSessionId, IdentifySessionResponse>({
      handleInterval: requestInterval,
      handleData: async (sessionTraitsWithSessionIds) => {
        const { sessionId, sessionTraits } = this.extractSessionIdAndSessionTraits(sessionTraitsWithSessionIds)
        return await this.handleSessionTraits(sessionId, sessionTraits)
      },
    })
    this.screenRecordBuffer = new DataBuffering<ScreenRecordWithSessionId, AddSessionRecordingResponse>({
      handleInterval: requestInterval,
      handleData: async (screenRecordsWithSessionIds) => {
        const { sessionId, screenRecords } = this.extractSessionIdAndScreenRecords(screenRecordsWithSessionIds)
        return await this.handleScreenRecords(sessionId, screenRecords)
      },
      isFlushingAllowed: false,
    })
    this.sessionMetricBuffer = new DataBuffering<SessionMetricWithSessionId, MonitorSessionResponse>({
      handleInterval: requestInterval,
      handleData: async (screenMetricWithSessionIds) => {
        const { sessionId, metrics } = this.extractSessionIdAndMetrics(screenMetricWithSessionIds)
        return await this.handleSessionMetrics(sessionId, metrics)
      },
      isFlushingAllowed: false,
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

  async monitorSession(sessionId: string, metric: GravityMetric) {
    await this.sessionMetricBuffer.addData({
      sessionId,
      metric,
    })
  }

  async flush() {
    return await Promise.all([
      this.sessionUserActionBuffer.flush(),
      this.screenRecordBuffer.flush(),
      this.sessionTraitsBuffer.flush(),
    ])
  }

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

  protected abstract handleSessionMetrics(
    sessionId: string,
    metric: ReadonlyArray<GravityMetric>,
  ): Promise<MonitorSessionResponse>

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

  private extractSessionIdAndMetrics(
    sessionMetricsWithSessionIds: ReadonlyArray<SessionMetricWithSessionId>,
  ): SessionMetricsWithSessionId {
    const sessionId = sessionMetricsWithSessionIds[0]?.sessionId
    if (sessionId === undefined) {
      throw new Error('No session id')
    }

    const metrics: GravityMetric[] = []
    for (const screenRecordWithSessionId of sessionMetricsWithSessionIds) {
      if (sessionId === screenRecordWithSessionId.sessionId) {
        metrics.push(screenRecordWithSessionId.metric)
      }
    }
    return {
      sessionId,
      metrics,
    }
  }
}
