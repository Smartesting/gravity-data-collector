import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import RECORDING_SETTINGS, { WITH_PARTIAL_ANONYMIZATION, WITH_TOTAL_ANONYMIZATION } from './recordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

export default class ScreenRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(private readonly sessionIdHandler: ISessionIdHandler, private readonly gravityClient: IGravityClient) {}

  initializeRecording(options?: Partial<{ anonymization: boolean }>) {
    const handleRecord = this.handle.bind(this)
    // @ts-expect-error
    this.stopRecording = record({
      emit(event) {
        void handleRecord(event)
      },
      ...RECORDING_SETTINGS,
      ...(options?.anonymization ? WITH_TOTAL_ANONYMIZATION : WITH_PARTIAL_ANONYMIZATION),
    })
  }

  terminateRecording() {
    this.stopRecording?.()
  }

  async handle(screenRecord: eventWithTime) {
    return await this.gravityClient.addScreenRecord(this.sessionIdHandler.get(), screenRecord)
  }
}
