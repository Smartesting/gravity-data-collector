import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import RECORDING_SETTINGS, {
  WITH_DEFAULT_ANONYMIZATION,
  WITH_PARTIAL_ANONYMIZATION,
  WITH_TOTAL_ANONYMIZATION,
} from './recordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'

interface ScreenRecordingOptions {
  enableAnonymization?: boolean
  anonymizeSelectors?: string
  ignoreSelectors?: string
}

export default class ScreenRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(private readonly sessionIdHandler: ISessionIdHandler, private readonly gravityClient: IGravityClient) {}

  initializeRecording(options?: ScreenRecordingOptions) {
    const handleRecord = this.handle.bind(this)
    const anonymization = options?.enableAnonymization
      ? WITH_TOTAL_ANONYMIZATION
      : options?.anonymizeSelectors
      ? { ...WITH_DEFAULT_ANONYMIZATION, maskTextSelector: options.anonymizeSelectors }
      : { ...WITH_PARTIAL_ANONYMIZATION }
    // @ts-expect-error
    this.stopRecording = record({
      emit(event) {
        void handleRecord(event)
      },
      ...RECORDING_SETTINGS,
      ...anonymization,
      blockSelector: options?.ignoreSelectors,
    })
  }

  terminateRecording() {
    this.stopRecording?.()
  }

  async handle(screenRecord: eventWithTime) {
    return await this.gravityClient.addScreenRecord(this.sessionIdHandler.get(), screenRecord)
  }
}
