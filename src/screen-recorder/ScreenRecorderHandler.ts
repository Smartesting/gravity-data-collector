import { IGravityClient } from '../gravity-client/IGravityClient'
import { record } from 'rrweb'
import { eventWithTime, listenerHandler } from '@rrweb/types'

export default class ScreenRecorderHandler {
  private stopRecording: listenerHandler | undefined

  constructor(private readonly gravityClient: IGravityClient) {}

  initializeRecording() {
    const handleRecord = this.handle.bind(this)
    this.stopRecording = record({
      emit(event) {
        handleRecord(event)
      },
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
