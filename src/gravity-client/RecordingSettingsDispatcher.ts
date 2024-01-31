import { NO_RECORDING_SETTINGS, RecordingSettings } from '../types'

type RecordingSettingsListener = (settings: RecordingSettings) => void

export default class RecordingSettingsDispatcher {
  private readonly listeners: Array<RecordingSettingsListener> = []

  subscribe(listener: RecordingSettingsListener): void {
    this.listeners.push(listener)
  }

  dispatch(settings: RecordingSettings) {
    this.listeners.forEach((listener) => listener(settings))
  }

  terminate() {
    this.dispatch(NO_RECORDING_SETTINGS)
  }
}
