import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import RECORDING_SETTINGS from '../utils/rrwebRecordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'

export default class VideoRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly gravityClient: IGravityClient,
  ) {}

  initializeRecording() {
    const handleRecord = this.handle.bind(this)
    this.stopRecording = record({
      emit(event) {
        void handleRecord(event)
      },
      ...RECORDING_SETTINGS,
    })
  }

  terminateRecording() {
    this.stopRecording?.()
  }

  async handle(screenRecord: eventWithTime) {
    if (!this.timeoutHandler.isExpired()) {
      return await this.gravityClient.addScreenRecord(this.sessionIdHandler.get(), screenRecord)
    }
  }
}
