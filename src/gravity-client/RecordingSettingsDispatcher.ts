import { RecordingSettings } from './AbstractGravityClient'

type RecordingSettingsListener = (settings: RecordingSettings) => void

export class RecordingSettingsDispatcher {
  private readonly listeners: Array<RecordingSettingsListener> = []

  subscribe(listener: RecordingSettingsListener): void {
    this.listeners.push(listener)
  }

  dispatch(settings: RecordingSettings) {
    this.listeners.forEach((listener) => listener(settings))
  }
}
