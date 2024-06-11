import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from '@smartesting/rrweb'
import { eventWithTime, listenerHandler } from '@smartesting/rrweb-types'
import RECORDING_SETTINGS, {
  WITH_DEFAULT_ANONYMIZATION,
  WITH_PARTIAL_ANONYMIZATION,
  WITH_TOTAL_ANONYMIZATION,
} from '../utils/rrwebRecordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import { CollectorOptions } from '../types'

export interface ScreenRecordingOptions {
  enableAnonymization?: boolean
  anonymizeSelectors?: string
  ignoreSelectors?: string
}

export default class VideoRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(
    private readonly options: CollectorOptions,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly gravityClient: IGravityClient,
  ) {}

  initializeRecording(options?: ScreenRecordingOptions) {
    const handleRecord = this.handle.bind(this)
    const anonymization = options?.enableAnonymization
      ? WITH_TOTAL_ANONYMIZATION
      : options?.anonymizeSelectors
      ? { ...WITH_DEFAULT_ANONYMIZATION, maskTextSelector: options.anonymizeSelectors }
      : { ...WITH_PARTIAL_ANONYMIZATION }
    this.stopRecording = record({
      emit(event) {
        void handleRecord(event)
      },
      ...RECORDING_SETTINGS,
      ...anonymization,
      blockSelector: options?.ignoreSelectors,
      window: this.options.window,
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
