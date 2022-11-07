const collectionAuthKey = '1234'

describe('Handling sessions on multi-domain', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('uses the same session ID on a sub-domains', () => {
    cy.intercept(
      {
        method: 'POST',
        url: `https://gravityserverstaging.herokuapp.com/api/tracking/${collectionAuthKey}/publish`,
      },
      {
        statusCode: 200,
        body: { error: null },
      },
    ).as('sendGravityRequest')

    cy.visit('http://my-site.com:3000/')
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.get('a.go-to-app').click()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.url().should('eq', 'http://app.my-site.com:3000/')

        cy.get('a.simple-link').click()
        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('uses another sessions ID when navigating to another domain', () => {
    cy.intercept(
      {
        method: 'POST',
        url: `https://gravityserverstaging.herokuapp.com/api/tracking/${collectionAuthKey}/publish`,
      },
      {
        statusCode: 200,
        body: { error: null },
      },
    ).as('sendGravityRequest')

    cy.visit('http://my-site.com:3000/')
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.get('a.go-to-another-site').click()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.url().should('eq', 'http://auth.another-site.com:3000/')

        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).not.to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('finds back the original session ID when coming back to the source site', () => {
    cy.intercept(
      {
        method: 'POST',
        url: `https://gravityserverstaging.herokuapp.com/api/tracking/${collectionAuthKey}/publish`,
      },
      {
        statusCode: 200,
        body: { error: null },
      },
    ).as('sendGravityRequest')

    cy.visit('http://my-site.com:3000/')
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.get('a.go-to-another-site').click()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.url().should('eq', 'http://auth.another-site.com:3000/')

        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).not.to.eq(mySiteSessionId)

          cy.get('a.go-to-app').click()
          cy.wait('@sendGravityRequest').then((_) => {
            cy.url().should('eq', 'http://app.my-site.com:3000/')

            cy.get('a.simple-link').click()
            cy.wait('@sendGravityRequest').then((interception3) => {
              expect(interception3.request.body[0].sessionId).to.eq(mySiteSessionId)
            })
          })
        })
      })
    })
  })
})
