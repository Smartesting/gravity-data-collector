import { defineConfig } from 'cypress'
import { CollectorOptions, CookieStrategy, Listener } from './src/types'

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      let collectorOptions: Partial<CollectorOptions> = {
        authKey: '1234',
        requestInterval: 100,
        gravityServerUrl: 'https://api.gravity.smartesting.com',
        enabledListeners: [Listener.Click, Listener.KeyUp, Listener.KeyDown, Listener.Change],
        cookieStrategy: CookieStrategy.subDomains,
      }

      on('task', {
        setCollectorOptions: (opts: Partial<CollectorOptions>) => {
          collectorOptions = { ...collectorOptions, ...opts }
          return null
        },
        getCollectorOptions: () => collectorOptions,
      })
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
    'another-site.com': '127.0.0.1',
    'auth.another-site.com': '127.0.0.1',
  },
})
