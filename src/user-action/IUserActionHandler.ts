import { AnonymizationSettings, NO_ANONYMIZATION_SETTINGS, UserAction } from '../types'

export default interface IUserActionHandler {
  handle: (action: UserAction) => void

  getAnonymizationSettings: () => AnonymizationSettings
}

export class NopUserActionHandler implements IUserActionHandler {
  handle(): void {}

  getAnonymizationSettings() {
    return NO_ANONYMIZATION_SETTINGS
  }
}
