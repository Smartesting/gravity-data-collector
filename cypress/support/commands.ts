/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('interceptGravityPublish', (onReq?: (req: any) => void) => {
  return cy
    .intercept(
      {
        method: 'POST',
        url: `https://api.gravity.smartesting.com/api/tracking/*/publish`,
      },
      (req) => {
        if (onReq) {
          onReq(req)
        }
        req.reply({
          statusCode: 200,
          body: { error: null },
        })
      },
    )
    .as('sendGravityRequest')
})

Cypress.Commands.add('interceptGravityIdentify', (onReq: (req: any) => void) => {
  cy.intercept(
    {
      method: 'POST',
      url: `https://api.gravity.smartesting.com/api/tracking/*/identify/*`,
    },
    (req) => {
      onReq(req)
      req.reply({
        statusCode: 200,
        body: { error: null },
      })
    },
  ).as('sendGravityIdentify')
})

Cypress.Commands.add('openBaseSite', (path?: string) => {
  return cy.visit(`http://my-site.com:3000/${path ?? ''}`)
})

Cypress.Commands.add('identifySession', () => {
  return cy.get('a.identify-link').click()
})

Cypress.Commands.add('publishUserEvent', () => {
  return cy.get('a.simple-link').click()
})

Cypress.Commands.add('goToApp', () => {
  cy.get('a.go-to-app').click()
  return cy.url().should('eq', 'http://app.my-site.com:3000/')
})

Cypress.Commands.add('goToHome', () => {
  cy.get('a.go-to-home').click()
  return cy.url().should('eq', 'http://my-site.com:3000/')
})

Cypress.Commands.add('goToOtherSite', () => {
  cy.get('a.go-to-another-site').click()
  return cy.url().should('eq', 'http://auth.another-site.com:3000/')
})

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Intercepts publish requests to Gravity
       * @example cy.interceptGravityPublish()
       */
      interceptGravityPublish(onReq?: (req: any) => void): Chainable

      interceptGravityIdentify(onReq: (req: any) => void): Chainable

      openBaseSite(path?: string): Chainable

      identifySession(): Chainable

      publishUserEvent(): Chainable

      goToApp(): Chainable

      goToHome(): Chainable

      goToOtherSite(): Chainable
    }
  }
}

// We can not declare global without having an export, so why not a function
// which logs plop ?
export default function plop() {
  console.log('plop')
}
