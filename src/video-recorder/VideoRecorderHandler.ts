import { IGravityClient } from '../gravity-client/IGravityClient'
import { record, recordOptions } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import RECORDING_SETTINGS from '../utils/rrwebRecordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'
import { AnonymizationSettings, DEFAULT_ANONYMIZATION_SETTINGS } from '../types'
import maskText from '../utils/maskText'

export default class VideoRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly gravityClient: IGravityClient,
    private readonly win = window,
    private readonly getAnonymizationSettings: () => AnonymizationSettings | undefined = () => undefined,
  ) {}

  initializeRecording() {
    this.instanciateVideoRecorder()

    window.addEventListener('load', () => {
      let oldHref = document.location.href
      const body = document.querySelector('body')
      if (!body) return

      const observer = new MutationObserver(mutations => {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href

          this.terminateRecording()
          this.instanciateVideoRecorder()
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

  private instanciateVideoRecorder() {
    const location = this.win.location
    const anonymizationSettings = this.getAnonymizationSettings() ?? DEFAULT_ANONYMIZATION_SETTINGS
    const handleRecord = this.handle.bind(this)

    const recordingSettings: recordOptions<eventWithTime> = { ...RECORDING_SETTINGS }
    if (anonymizationSettings.anonymize) {
      const allowedList = anonymizationSettings.allowList.reduce<string[]>((acc, { pageMatcher, allowedSelectors }) => {
        if (location.href.match(pageMatcher)) {
          acc.push(...allowedSelectors)
        }
        return acc
      }, [])
      recordingSettings.maskTextSelector = allowedList.map(selector => `:not(${selector})`).join(', ')
      recordingSettings.maskTextFn = maskText
    }

    this.stopRecording = record({
      emit(event) {
        void handleRecord(event)
      },
      ...recordingSettings,
    })
  }
}
