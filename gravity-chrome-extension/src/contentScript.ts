import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'
import { uuid } from '../../src/utils/uuid'
import { Message } from './types'

let authorizedSites: string[] = []

const options: Partial<CollectorOptions> = {}

chrome.storage.local.get(
  [
    'gravityServerUrl',
    'authenticationKey',
    'authorizedSites',
    'requestInterval',
    'useHashInUrlAsPathname',
    'inlineResources',
  ],
  (settings) => {
    if (settings.authenticationKey) {
      options.authKey = settings.authenticationKey
      options.debug = !options.authKey || options.authKey.length === 0
    }
    if (settings.authorizedSites) {
      authorizedSites = settings.authorizedSites
    }
    if (settings.gravityServerUrl) {
      options.gravityServerUrl = settings.gravityServerUrl
    }
    if (settings.requestInterval) {
      options.requestInterval = settings.requestInterval
    }
    if (settings.useHashInUrlAsPathname) {
      options.useHashInUrlAsPathname = settings.useHashInUrlAsPathname
    }
    if (settings.inlineResources) {
      options.inlineResources = settings.inlineResources
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
      options.debug = !options.authKey || options.authKey.length === 0
      break
    case 'updateGravityServerUrl':
      options.gravityServerUrl = message.url
      break
    case 'updateRequestInterval':
      options.requestInterval = message.interval
      break
    case 'updateInlineResources':
      options.inlineResources = message.value
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
