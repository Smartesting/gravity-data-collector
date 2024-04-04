import { GravityRecordingSettings, NO_RECORDING_SETTINGS } from '../types'

type RecordingSettingsListener = (settings: GravityRecordingSettings) => void

export default class RecordingSettingsDispatcher {
  private readonly listeners: Array<RecordingSettingsListener> = []

  subscribe(listener: RecordingSettingsListener): void {
    this.listeners.push(listener)
  }

  dispatch(settings: GravityRecordingSettings) {
    this.listeners.forEach((listener) => listener(settings))
  }

  terminate() {
    this.dispatch(NO_RECORDING_SETTINGS)
  }
}
