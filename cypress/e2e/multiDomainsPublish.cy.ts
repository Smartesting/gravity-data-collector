describe('Handling sessions on multi-domain', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('uses the same session ID when navigating through different paths of the same domain', () => {
    cy.interceptGravityPublish()
    cy.interceptGravityRecord()
    cy.interceptGravityCollectionSettings()
    cy.openBaseSite('contact/')
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.goToHome()
      cy.publishUserEvent()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('uses another session ID when navigating to another domain', () => {
    cy.interceptGravityPublish()
    cy.interceptGravityRecord()
    cy.interceptGravityCollectionSettings()
    cy.openBaseSite()
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.goToOtherSite()
      cy.wait('@sendGravityRequest').then((_) => {
        cy.wait('@sendGravityRequest').then((interception2) => {
          expect(interception2.request.body[0].sessionId).not.to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('finds back the original session ID when coming back to the source site', () => {
    cy.interceptGravityPublish()
    cy.interceptGravityRecord()
    cy.interceptGravityCollectionSettings()
    cy.openBaseSite()
    cy.wait('@sendGravityRequest').then((interception) => {
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.goToOtherSite()
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
