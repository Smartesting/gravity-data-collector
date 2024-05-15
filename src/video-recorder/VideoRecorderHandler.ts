import { IGravityClient } from '../gravity-client/IGravityClient'
import { record, recordOptions } from '@smartesting/rrweb'
import { eventWithTime, listenerHandler } from '@smartesting/rrweb-types'
import RECORDING_SETTINGS from '../utils/rrwebRecordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import { AnonymizationSettings, CollectorOptions, DEFAULT_ANONYMIZATION_SETTINGS } from '../types'
import { getRRWebAnonymizationSettings } from '../utils/getRRWebAnonymizationSettings'

export default class VideoRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(
    private readonly options: CollectorOptions,
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly gravityClient: IGravityClient,
    private readonly getAnonymizationSettings: () => AnonymizationSettings | undefined = () => undefined,
  ) {}

  initializeRecording() {
    this.instantiateVideoRecorder()
    const window = this.options.window
    const document = window.document
    window.addEventListener('load', () => {
      let oldHref = document.location.href
      const body = document.querySelector('body')
      if (!body) return

      const observer = new MutationObserver(() => {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href

          this.terminateRecording()
          this.instantiateVideoRecorder()
        }
      })
      observer.observe(body, {
        childList: true,
        subtree: true,
      })
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

  private instantiateVideoRecorder() {
    const anonymizationSettings = this.getAnonymizationSettings() ?? DEFAULT_ANONYMIZATION_SETTINGS
    const handleRecord = this.handle.bind(this)

    const window = this.options.window
    const recordingSettings: recordOptions<eventWithTime> = {
      ...RECORDING_SETTINGS,
      ...getRRWebAnonymizationSettings(anonymizationSettings, window.location),
      window,
    }

    this.stopRecording = record({
      emit(event: eventWithTime) {
        void handleRecord(event)
      },
      ...recordingSettings,
    })
  }
}
