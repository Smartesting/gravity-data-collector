// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import { CollectorOptions, CookieStrategy, Listener } from '../../src/types'
import GravityCollector from '../../src'

// Alternatively you can use CommonJS syntax:
// require('./commands')

beforeEach(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.interceptGravityCollectionSettings()
  cy.interceptGravityPublish()
  cy.interceptGravityIdentify()
  cy.interceptGravityRecord()

  cy.task('getCollectorOptions').then((collectorOptions) => {
    if (!isPartialCollectorOptions(collectorOptions)) return
    return cy.on('window:load', (win) => {
      function waitForPageToLoad(collectorOptions: Partial<CollectorOptions>) {
        const url = win.document.URL

        if (url === undefined || url.startsWith('about:')) {
          setTimeout(() => waitForPageToLoad(collectorOptions), 5)
        } else {
          GravityCollector.init({
            window: win,
            ...collectorOptions,
          })
        }
      }

      waitForPageToLoad(collectorOptions)
    })
  })
})

afterEach(() => {
  cy.task('setCollectorOptions', {
    authKey: '1234',
    requestInterval: 100,
    gravityServerUrl: 'https://api.gravity.smartesting.com',
    enabledListeners: [Listener.Click, Listener.KeyUp, Listener.KeyDown, Listener.Change],
    cookieStrategy: CookieStrategy.subDomains,
  })
})

function isPartialCollectorOptions(toBeDetermined: unknown): toBeDetermined is Partial<CollectorOptions> {
  return (
    toBeDetermined !== undefined &&
    typeof toBeDetermined === 'object' &&
    (toBeDetermined as CollectorOptions).authKey !== undefined
  )
}
