import { CollectorOptions, ConsoleEventHandlerOptions, GravityEventHandlerOptions } from '../types'

export default function completeOptions(options?: Partial<CollectorOptions>): CollectorOptions {
  const authKeyError = new Error('No AuthKey provided')
  if (options == null) {
    throw authKeyError
  }

  if (options.debug === true) {
    const consoleOptions = options as ConsoleEventHandlerOptions
    const simulation = consoleOptions.simulation ?? false
    const maxDelay = consoleOptions.maxDelay ?? 500

    return {
      debug: true,
      simulation,
      maxDelay,
    }
  }

  const gravityOptions = options as GravityEventHandlerOptions
  if (gravityOptions.authKey === null || gravityOptions.authKey === undefined) {
    throw authKeyError
  }
  return {
    debug: false,
    authKey: gravityOptions.authKey,
    delay: gravityOptions.delay ?? 5000,
  }
}
