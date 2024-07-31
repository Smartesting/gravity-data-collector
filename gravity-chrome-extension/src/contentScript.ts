import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'
import { uuid } from '../../src/utils/uuid'
import { Message } from './types'

let authorizedSites: string[] = []

const options: Partial<CollectorOptions> = {}

chrome.storage.local.get(
  [
    'debugMode',
    'gravityServerUrl',
    'authenticationKey',
    'authorizedSites',
    'requestInterval',
    'useHashInUrlAsPathname',
  ],
  (settings) => {
    if (settings.hasOwnProperty('debugMode')) {
      options.debug = Boolean(settings.debugMode)
    }
    if (settings.hasOwnProperty('authenticationKey')) {
      options.authKey = settings.authenticationKey
    }
    if (settings.hasOwnProperty('authorizedSites')) {
      authorizedSites = settings.authorizedSites
    }
    if (settings.hasOwnProperty('gravityServerUrl')) {
      options.gravityServerUrl = settings.gravityServerUrl
    }
    if (settings.hasOwnProperty('requestInterval')) {
      options.requestInterval = settings.requestInterval
    }
    if (settings.hasOwnProperty('useHashInUrlAsPathname')) {
      options.useHashInUrlAsPathname = settings.useHashInUrlAsPathname
    }
    console.log({ options })
    if (
      options.authKey &&
      options.authKey.length > 0 &&
      authorizedSites.some((authorized) => window.location.href.includes(authorized))
    ) {
      GravityCollector.init(options)
      console.log('Auto init Gravity collector')
    } else {
      console.log('Current location no in the authorized sites')
    }
  },
)

chrome.runtime.onMessage.addListener((message: Message) => {
  switch (message.action) {
    case 'updateDebugMode':
      options.debug = message.value
      break
    case 'startNewSession':
      if (authorizedSites.some((authorized) => window.location.href.includes(authorized))) {
        GravityCollector.initWithOverride(options, uuid())
        console.log('Init Gravity collector after new session', { options })
      } else {
        console.log('Current location no in the authorized sites')
      }
      break
    case 'updateAuthKey':
      options.authKey = message.authKey
      break
    case 'updateGravityServerUrl':
      options.gravityServerUrl = message.url
      break
    case 'updateRequestInterval':
      options.requestInterval = message.interval
      break
    case 'updateUseHashInUrlAsPathname':
      options.useHashInUrlAsPathname = message.value
      break
    case 'updateAuthorisedSites':
      authorizedSites = message.sites
      break
    default:
      console.log('Unknown gravity chrome extension action: ' + message)
  }
})
