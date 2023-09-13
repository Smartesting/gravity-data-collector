describe('Handling sessions identification on multi-domain', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('uses another sessions ID when navigating to another domain', () => {
    const requests: { sessionId: string, href: string }[] = []

    cy.interceptGravityPublish()
    cy.interceptGravityIdentify((req) => {
      requests.push(extractSessionIdAndHref(req))
    })

    cy.openBaseSite()
    cy.identifySession()
    cy.wait('@sendGravityIdentify').then(() => {
      cy.goToOtherSite()
      cy.identifySession()

      cy.wait('@sendGravityIdentify').then(() => {
        expect(requests.length).to.eq(2)

        const sessionIds = requests.map((request) => request.sessionId)
        expect(sessionIds[0]).not.to.eq(sessionIds[1])
      })
    })
  })

  it('finds back the original session ID when coming back to the source site', () => {
    const requests: { sessionId: string, href: string }[] = []

    cy.interceptGravityPublish()
    cy.interceptGravityIdentify((req) => {
      requests.push(extractSessionIdAndHref(req))
    })

    cy.openBaseSite()
    cy.identifySession()
    cy.wait('@sendGravityIdentify').then(() => {
      cy.goToOtherSite()
      cy.identifySession()

      cy.wait('@sendGravityIdentify').then(() => {
        cy.goToApp()
        cy.identifySession()

        cy.wait('@sendGravityIdentify').then(() => {
          expect(requests.length).to.eq(3)

          const sessionIds = requests.map((request) => request.sessionId)
          expect(sessionIds[0]).to.eq(sessionIds[2])
          expect(sessionIds[0]).not.to.eq(sessionIds[1])
        })
      })
    })
  })
})

function extractSessionIdAndHref(req: any) {
  const { url, body } = req
  const urlSegments = url.split('/')
  const sessionId = urlSegments.pop()!

  return { sessionId, href: body.href }
}
