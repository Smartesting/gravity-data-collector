import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import RECORDING_SETTINGS from './recordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

export default class ScreenRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(private readonly sessionIdHandler: ISessionIdHandler, private readonly gravityClient: IGravityClient) {}

  initializeRecording() {
    const handleRecord = this.handle.bind(this)
    // @ts-expect-error
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
    return await this.gravityClient
      .addScreenRecord(this.sessionIdHandler.get(), screenRecord)
      .then(() => {})
      .catch(() => {})
  }
}
