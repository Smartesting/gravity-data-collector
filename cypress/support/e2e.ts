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
import GravityCollector from '../../src'
import { GRAVITY_SESSION_TRACKING_SUSPENDED } from '../../src/tracking-handler/TrackingHandler'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('window:load', (win) => {
  ;(win as typeof window).sessionStorage.removeItem(GRAVITY_SESSION_TRACKING_SUSPENDED)

  GravityCollector.init({
    authKey: '1234',
    requestInterval: 100,
    gravityServerUrl: 'https://api.gravity.smartesting.com',
    window: win,
  })
})
