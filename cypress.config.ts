import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    retries: {
      openMode: 0,
      runMode: 2,
    },
  },
  chromeWebSecurity: false,
  hosts: {
    'my-site.com': '127.0.0.1',
    'app.my-site.com': '127.0.0.1',
    'auth.another-site.com': '127.0.0.1',
  },
})
