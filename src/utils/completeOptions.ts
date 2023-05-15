import { CollectorOptions, CreateSelectorsOptions, QueryType } from '../types'
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
  checkSelectorsOptions(completedOptions.selectorsOptions ?? {})

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

function checkSelectorsOptions(selectorsOptions: Partial<CreateSelectorsOptions>) {
  const { attributes, queries, excludedQueries } = selectorsOptions

  checkArrayOf(
    attributes,
    assertString,
    (value) => `option "selectorsOptions.attributes": "${value}" is not a valid option. Expected a list of strings`,
    (value) => `option "selectorsOptions.attributes": "${value}" is not a valid string`
  )

  checkArrayOf(
    queries,
    assertQueryType,
    (value) => `option "selectorsOptions.queries": "${value}" is not a valid option. Expected a list of QueryType`,
    (value) => `option "selectorsOptions.queries": "${value}" is not a valid QueryType. Valid values are: ${Object.values(QueryType).join(', ')}`
  )

  checkArrayOf(
    excludedQueries,
    assertQueryType,
    (value) => `option "selectorsOptions.excludedQueries": "${value}" is not a valid option. Expected a list of QueryType`,
    (value) => `option "selectorsOptions.excludedQueries": "${value}" is not a valid QueryType. Valid values are: ${Object.values(QueryType).join(', ')}`
  )
}

function checkArrayOf(
  toBeChecked: unknown,
  checker: (value: unknown) => boolean,
  makeNotArrayMessage: (value: unknown) => string,
  makeInvalidTypeMessage: (value: unknown) => string,
): void {
  if (toBeChecked === undefined) return
  if (!Array.isArray(toBeChecked)) throw new Error(makeNotArrayMessage(toBeChecked))
  for (const item of toBeChecked) {
    if (!checker(item)) throw new Error(makeInvalidTypeMessage(item))
  }
}

function assertString(toBeDetermined: unknown): toBeDetermined is String {
  return typeof(toBeDetermined) === 'string'
}

function assertQueryType(toBeDetermined: unknown): toBeDetermined is QueryType {
  return Object.values(QueryType).includes(toBeDetermined as QueryType)
}