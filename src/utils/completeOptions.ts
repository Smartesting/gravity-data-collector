import { CollectorOptions } from '../types'

export default function completeOptions(options?: Partial<CollectorOptions>): CollectorOptions {
  const authKeyError = new Error('No AuthKey provided')
  if (options == null) {
    throw authKeyError
  }

  if (options.debug === true) {
    return {
      authKey: options.authKey ?? '',
      debug: true,
      maxDelay: options.maxDelay ?? 500,
      requestInterval: options.requestInterval ?? 5000,
    }
  }

  if (options.authKey === null || options.authKey === undefined) {
    throw authKeyError
  }
  return {
    authKey: options.authKey,
    debug: false,
    maxDelay: 0,
    requestInterval: options.requestInterval ?? 5000,
  }
}
