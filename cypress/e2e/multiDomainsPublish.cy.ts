import { SessionUserAction } from '../../src/types'

describe('Handling sessions on multi-domain', () => {
  let userActions: SessionUserAction[] = []

  beforeEach(() => {
    userActions = []
    cy.task('setCollectorOptions', { requestInterval: 0 })

    cy.interceptGravityPublish((req) => {
      userActions.push(...req.body)
    })
  })

  it('uses the same session ID when navigating through different paths of the same domain', () => {
    cy.openBaseSite('contact/')
    cy.publishUserEvent()
    cy.wait('@sendGravityRequest').then(() => {
      cy.goToHome()
      cy.publishUserEvent()

      cy.wait('@sendGravityRequest').then(() => {
        console.log({ userActions })
      })
    })
  })

  it.skip('uses another session ID when navigating to another domain', () => {
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

  it.skip('finds back the original session ID when coming back to the source site', () => {
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
