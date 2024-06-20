import GravityCollector from '../../src'
import { CollectorOptions } from '../../src/types'
import { uuid } from '../../src/utils/uuid'

export type MESSAGE_TYPE = {
  action: string
  authKey: string
  authorizedSites: string[]
}

let authorizedSites: string[] = []

const options: Partial<CollectorOptions> = {
  gravityServerUrl: 'http://localhost:3000/',
  requestInterval: 0,
}

chrome.storage.local.get(['authenticationKey', 'authorizedSites'], (settings) => {
  if (settings.authenticationKey) {
    options.authKey = settings.authenticationKey
    options.debug = !options.authKey || options.authKey.length === 0
  }
  if (settings.authorizedSites) {
    authorizedSites = settings.authorizedSites
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
})

chrome.runtime.onMessage.addListener((message: MESSAGE_TYPE) => {
  switch (message.action) {
    case 'newSession':
      if (authorizedSites.some((authorized) => window.location.href.includes(authorized))) {
        GravityCollector.initWithOverride(options, uuid())
        console.log('Init Gravity collector after new session', { options })
      } else {
        console.log('Current location no in the authorized sites')
      }
      break
    case 'newAuthenticationKey':
      if (message.authKey !== undefined) {
        options.authKey = message.authKey
        options.debug = !options.authKey || options.authKey.length === 0
      }
      break
    case 'newAuthorizedSites':
      if (message.authorizedSites !== undefined) {
        authorizedSites = message.authorizedSites
      }
      break
    default:
      console.log('Unknown gravity chrome extension action: ' + message.action)
  }
})
