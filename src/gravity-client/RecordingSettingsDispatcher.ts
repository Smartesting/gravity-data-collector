import { GravityRecordingSettings, Logger, NO_RECORDING_SETTINGS } from '../types'

type RecordingSettingsListener = (settings: GravityRecordingSettings) => void

export default class RecordingSettingsDispatcher {
  private readonly listeners: Array<RecordingSettingsListener> = []

  constructor(private readonly logger: Logger) {}

  subscribe(listener: RecordingSettingsListener): void {
    this.listeners.push(listener)
  }

  dispatch(settings: GravityRecordingSettings) {
    this.logger('dispatch settings', { settings })
    this.listeners.forEach((listener) => listener(settings))
  }

  terminate() {
    this.dispatch(NO_RECORDING_SETTINGS)
  }
}
