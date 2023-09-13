describe('Handling sessions on multi-domain', () => {
  beforeEach(function () {
    this.uaList = []
    cy.clearCookies()
    cy.interceptGravityPublish((req) => {
      return this.uaList.push(req.body)
    })
  })

  it('uses the same session ID when navigating through different paths of the same domain', function () {
    cy.openBaseSite('contact/')
      .goToHome()
      .publishUserEvent()
      .wait('@sendGravityRequest').then(() => {
        const sessionId = this.uaList[0].sessionId
        expect(this.uaList.every((ua) => ua.sessionId === sessionId))
      })
  })

  it('uses another session ID when navigating to another domain', function () {
    let baseSiteSessionId = null

    cy.openBaseSite()
      .publishUserEvent()
      .wait('@sendGravityRequest').then(() => {
        baseSiteSessionId = this.uaList[0].sessionId
        this.uaList.length = 0
      })
      .goToOtherSite()
      .wait('@sendGravityRequest').then(() => {
        expect(this.uaList.every((ua) => ua.sessionId !== baseSiteSessionId))
      })
  })

  it('finds back the original session ID when coming back to the source site', function () {
    let baseSiteSessionId = null

    cy.openBaseSite()
      .publishUserEvent()
      .wait('@sendGravityRequest').then(() => {
        baseSiteSessionId = this.uaList[0].sessionId
        this.uaList.length = 0
      })
      .goToOtherSite()
      .wait('@sendGravityRequest').then(() => {
        expect(this.uaList.every((ua) => ua.sessionId !== baseSiteSessionId))
        this.uaList.length = 0
      })
      .goToApp()
      .publishUserEvent()
      .wait('@sendGravityRequest').then(() => {
        expect(this.uaList.every((ua) => ua.sessionId === baseSiteSessionId))
      })
  })
})
