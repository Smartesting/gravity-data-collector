import { RecordingSettings } from './AbstractGravityClient'

export const ALL_RECORDING_SETTINGS_DISABLED: RecordingSettings = {
  enableEventRecording: false,
  enableVideoRecording: false,
  enableVideoAnonymization: false,
}

type RecordingSettingsListener = (settings: RecordingSettings) => void

export class RecordingSettingsDispatcher {
  private readonly listeners: Array<RecordingSettingsListener> = []

  subscribe(listener: RecordingSettingsListener): void {
    this.listeners.push(listener)
  }

  dispatch(settings: RecordingSettings) {
    this.listeners.forEach((listener) => listener(settings))
  }

  terminate() {
    this.dispatch(ALL_RECORDING_SETTINGS_DISABLED)
  }
}
