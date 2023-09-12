import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message: any) {
          console.log(message)
          return null
        }
      })
    },
  },
  chromeWebSecurity: false,
  hosts: {
    'my-site.com': '127.0.0.1',
    'app.my-site.com': '127.0.0.1',
    'auth.another-site.com': '127.0.0.1',
  },
})
