import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'
import RECORDING_SETTINGS from './recordingSettings'

export default class ScreenRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(private readonly gravityClient: IGravityClient) {}

  initializeRecording() {
    const handleRecord = this.handle.bind(this)
    // @ts-expect-error
    this.stopRecording = record({
      emit(event) {
        handleRecord(event)
      },
      ...RECORDING_SETTINGS,
    })
  }

  terminateRecording() {
    this.stopRecording?.()
  }

  handle(screenRecord: eventWithTime) {
    this.gravityClient
      .addScreenRecord(screenRecord)
      .then(() => {})
      .catch(() => {})
  }

  flush(): void {
    this.gravityClient.flush()
  }
}
