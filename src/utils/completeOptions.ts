import { CollectorOptions } from '../types'
import { GRAVITY_SERVER_ADDRESS } from '../gravityEndPoints'

export const DEFAULT_SESSION_REJECTION = () => false

export default function completeOptions(options?: Partial<CollectorOptions>): CollectorOptions {
  const authKeyError = new Error('No AuthKey provided')
  if (options == null) {
    throw authKeyError
  }

  const debug = options.debug === true ?? false

  const defaultOptions: CollectorOptions = {
    authKey: '',
    debug: false,
    maxDelay: 0,
    requestInterval: 5000,
    gravityServerUrl: GRAVITY_SERVER_ADDRESS,
    excludeRegex: null,
    sessionsPercentageKept: 100,
    rejectSession: DEFAULT_SESSION_REJECTION,
    minimumUserActions: 1,
  }

  const debugDefaultOptions = {
    ...defaultOptions,
    maxDelay: 500,
  }

  const completedOptions = {
    ...(debug ? debugDefaultOptions : defaultOptions),
    ...sanitizeOptions(options),
  }

  checkPropertyPercentage(completedOptions, 'sessionsPercentageKept')

  if (!debug && (options.authKey === null || options.authKey === undefined)) {
    throw authKeyError
  }
  return completedOptions
}

function sanitizeOptions(options: Partial<CollectorOptions>): Partial<CollectorOptions> {
  const sanitized = options
  if (options.gravityServerUrl !== undefined) {
    sanitized.gravityServerUrl = options.gravityServerUrl.replace(/\/$/, '')
  }
  return sanitized
}

function checkPropertyPercentage<T extends Object>(options: T, property: string & keyof T) {
  const percentage = options[property] as unknown as number
  if (isNaN(percentage) || percentage < 0 || percentage > 100) {
    throw new Error(`option "${property}": ${percentage} is not a valid percentage (should be in range 0..100)`)
  }
}
