const collectionAuthKey = '1234'

describe('Handling sessions on multi-domain', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('uses the same session ID on a sub-domains', () => {
    let mySiteSessionId: string = ''

    cy.intercept({
      method: 'POST',
      url: `https://gravityserverstaging.herokuapp.com/api/tracking/${collectionAuthKey}/publish`
    }, {
      statusCode: 200,
      body: {error: null}
    }).as('sendGravityRequest')

    cy.visit('http://my-site.com:3000/')
    cy.get('a.simple-link').click()
    cy.wait('@sendGravityRequest').then(interception => {
      mySiteSessionId = interception.request.body[0].sessionId
    })

    cy.get('a.go-to-app').click()
    cy.url().should('eq', 'http://app.my-site.com:3000/')

    cy.get('a.simple-link').click()
    cy.wait('@sendGravityRequest').then(interception => {
      const sessionId = interception.request.body[0].sessionId
      expect(sessionId).to.eq(mySiteSessionId)
    })
  })

  it('uses another sessions ID when navigating to another domain', () => {
    let mySiteSessionId: string = ''

    cy.intercept({
      method: 'POST',
      url: `https://gravityserverstaging.herokuapp.com/api/tracking/${collectionAuthKey}/publish`
    }, {
      statusCode: 200,
      body: {error: null}
    }).as('sendGravityRequest')

    cy.visit('http://my-site.com:3000/')
    cy.get('a.simple-link').click()
    cy.wait('@sendGravityRequest').then(interception => {
      mySiteSessionId = interception.request.body[0].sessionId
    })

    cy.get('a.go-to-another-site').click()
    cy.url().should('eq', 'http://auth.another-site.com:3000/')

    cy.get('a.simple-link').click()
    cy.wait('@sendGravityRequest').then(interception => {
      const sessionId = interception.request.body[0].sessionId
      expect(sessionId).not.to.eq(mySiteSessionId)
    })
  })

  it('finds back the original session ID when coming back to the source site', () => {
    let mySiteSessionId: string = ''

    cy.intercept({
      method: 'POST',
      url: `https://gravityserverstaging.herokuapp.com/api/tracking/${collectionAuthKey}/publish`
    }, {
      statusCode: 200,
      body: {error: null}
    }).as('sendGravityRequest')

    cy.visit('http://my-site.com:3000/')
    cy.get('a.simple-link').click()
    cy.wait('@sendGravityRequest').then(interception => {
      mySiteSessionId = interception.request.body[0].sessionId
    })

    cy.get('a.go-to-another-site').click()
    cy.url().should('eq', 'http://auth.another-site.com:3000/')

    cy.get('a.simple-link').click()
    cy.wait('@sendGravityRequest').then(interception => {
      const sessionId = interception.request.body[0].sessionId
      expect(sessionId).not.to.eq(mySiteSessionId)
    })

    cy.get('a.go-to-app').click()
    cy.url().should('eq', 'http://app.my-site.com:3000/')

    cy.get('a.simple-link').click()
    cy.wait('@sendGravityRequest').then(interception => {
      const sessionId = interception.request.body[0].sessionId
      expect(sessionId).to.eq(mySiteSessionId)
    })
  })
})