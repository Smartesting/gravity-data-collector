# Quick Cypress setup

If you want to quickly try Gravity data collector but do not have the possibility to add the script to your application (or do not want to), you can use the collector inside your Cypress tests.

What you will need:

- an account on [Gravity](https://gravity.smartesting.com)
- some Cypress E2E tests

The first step will be to install [@smartesting/gravity-data-collector](https://www.npmjs.com/package/@smartesting/gravity-data-collector) alongside your Cypress tests:

```shell
npm install --save-dev @smartesting/gravity-data-collector
```

In the Cypress E2E test file (usually found at `cypress/support/e2e.ts` or `cypress/support/e2e.js`), add the following lines:

```typecript
import GravityCollector from '../../src'

  GravityCollector.init({
    authKey: 'XXX',
    window: win,
  })
```

Note: you will have to replace `XXX` by the test collection auth key. To do so, login on Gravity, then go to `Data`> `Configuration`. Under the "Configure test environment" section, you will find a filed showing the "Authorisation key". This is what you should use to replace the XXX part.

Run your Cypress E2E tests as you usually do and you should then see some tests displayed in Gravity.
