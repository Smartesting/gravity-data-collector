import { GRAVITY_SERVER_ADDRESS } from '../event/handler/eventSessionSender'
import { CollectorOptions } from '../types'

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
  }

  const debugDefaultOptions = {
    ...defaultOptions,
    maxDelay: 500,
  }

  const completedOptions = {
    ...(debug ? debugDefaultOptions : defaultOptions),
    ...options,
  }

  if (!debug && (options.authKey === null || options.authKey === undefined)) {
    throw authKeyError
  }
  return completedOptions
}
