const collectionAuthKey = '1234'

describe('Handling sessions on multi-domain', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('uses the same session ID on a sub-domains', () => {
    cy.interceptGravityPublish()
    cy.openBaseSite()
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.goToApp()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.publishUserEvent()
        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('uses another sessions ID when navigating to another domain', () => {
    cy.interceptGravityPublish()
    cy.openBaseSite()
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.get('a.go-to-another-site').click()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).not.to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('finds back the original session ID when coming back to the source site', () => {
    cy.interceptGravityPublish()
    cy.openBaseSite()
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.get('a.go-to-another-site').click()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).not.to.eq(mySiteSessionId)
          cy.goToApp()
          cy.wait('@sendGravityRequest').then((_) => {
            cy.publishUserEvent()
            cy.wait('@sendGravityRequest').then((interception3) => {
              expect(interception3.request.body[0].sessionId).to.eq(mySiteSessionId)
            })
          })
        })
      })
    })
  })
})
