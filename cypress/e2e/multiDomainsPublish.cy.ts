describe('Handling sessions on multi-domain', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('uses the same session ID when navigating through different paths of the same domain', () => {
    cy.interceptGravityPublish()
    cy.openBaseSite('contact/')
    cy.wait('@sendGravityRequest').then((interception) => {
      cy.task('log', '---- interception ----')
      cy.task('log', interception.request.body)
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.goToHome()
      cy.publishUserEvent()
      cy.wait('@sendGravityRequest').then((uselessIntercept) => {
        cy.task('log', '---- uselessIntercept ----')
        cy.task('log', uselessIntercept.request.body)
        cy.wait('@sendGravityRequest').then((interception2) => {
          cy.task('log', '---- interception2 ----')
          cy.task('log', interception2.request.body)
          expect(interception2.request.body[0].sessionId).to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('uses another session ID when navigating to another domain', () => {
    cy.interceptGravityPublish()
    cy.openBaseSite()
    cy.wait('@sendGravityRequest').then((interception) => {
      cy.task('log', '---- interception ----')
      cy.task('log',interception.request.body)
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.goToOtherSite()
      cy.wait('@sendGravityRequest').then((uselessIntercept) => {
        cy.task('log', '---- uselessIntercept ----')
        cy.task('log', uselessIntercept.request.body)
        cy.wait('@sendGravityRequest').then((interception2) => {
          cy.task('log', '---- interception2 ----')
          cy.task('log', interception2.request.body)
          expect(interception2.request.body[0].sessionId).not.to.eq(mySiteSessionId)
        })
      })
    })
  })

  it('finds back the original session ID when coming back to the source site', () => {
    cy.interceptGravityPublish()
    cy.openBaseSite()
    cy.wait('@sendGravityRequest').then((interception) => {
      cy.task('log', '---- interception ----')
      cy.task('log', interception.request.body)
      const mySiteSessionId = interception.request.body[0].sessionId

      cy.goToOtherSite()
      cy.wait('@sendGravityRequest').then((uselessIntercept) => {
        cy.task('log', '---- uselessIntercept ----')
        cy.task('log', uselessIntercept.request.body)
        cy.wait('@sendGravityRequest').then((interception2) => {
          cy.task('log', '---- interception2 ----')
          cy.task('log', interception2.request.body)
          expect(interception2.request.body[0].sessionId).not.to.eq(mySiteSessionId)
          cy.goToApp()
          cy.wait('@sendGravityRequest').then((uselessIntercept2) => {
            cy.task('log', '---- uselessIntercept2 ----')
            cy.task('log', uselessIntercept2.request.body)
            cy.publishUserEvent()
            cy.wait('@sendGravityRequest').then((interception3) => {
              cy.task('log', '---- interception3 ----')
              cy.task('log', interception3.request.body)
              expect(interception3.request.body[0].sessionId).to.eq(mySiteSessionId)
            })
          })
        })
      })
    })
  })
})
