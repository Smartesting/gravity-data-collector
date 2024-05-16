import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import RECORDING_SETTINGS from '../utils/rrwebRecordingSettings'
import ISessionIdHandler from '../session-id-handler/ISessionIdHandler'
import ITimeoutHandler from '../timeout-handler/ITimeoutHandler'

export interface ScreenRecordingOptions {
  enableAnonymization?: boolean
  anonymizeSelectors?: string
  ignoreSelectors?: string
}

export default class VideoRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(
    private readonly sessionIdHandler: ISessionIdHandler,
    private readonly timeoutHandler: ITimeoutHandler,
    private readonly gravityClient: IGravityClient,
  ) {}

  initializeRecording(options?: ScreenRecordingOptions) {
    this.instanciateVideoRecorder(options ?? {}, window.location)

    window.addEventListener('load', () => {
      let oldHref = document.location.href
      const body = document.querySelector('body')
      if (!body) return

      const observer = new MutationObserver(mutations => {
        if (oldHref !== document.location.href) {
          oldHref = document.location.href

          this.terminateRecording()
          this.instanciateVideoRecorder(options ?? {}, window.location)
        }
      })
      observer.observe(body, { childList: true, subtree: true })
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

  private instanciateVideoRecorder(options: ScreenRecordingOptions, location: typeof window.location) {
    const handleRecord = this.handle.bind(this)

    const maskingByPage: {matcher: RegExp, maskTextFn: (txt: string) => string}[] = [
      { matcher: /login/, maskTextFn: (txt) => txt.trim().replace(/.*/g, '#') },
      { matcher: /user-journeys/, maskTextFn: (txt) => txt.trim().replace(/.*/g, 'U') },
      { matcher: /sessions/, maskTextFn: (txt) => txt.trim().replace(/.*/g, '-') },
      { matcher: /.*/, maskTextFn: txt => txt },
    ]

    const masking = maskingByPage.find(({ matcher }) => matcher.exec(window.location.href) !== null)

    if (masking) console.log(`Found masking for ${window.location.href}: ${String(masking.matcher)}`)

    const maskTextFn = masking ? masking.maskTextFn : (txt: string) => txt

    this.stopRecording = record({
      emit(event) {
        void handleRecord(event)
      },
      ...RECORDING_SETTINGS,
      maskTextSelector: '*',
      maskTextFn,
      blockSelector: options?.ignoreSelectors,
    })
  }
}
