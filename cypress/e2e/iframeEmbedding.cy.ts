describe('Handling sessions identification on iframes', () => {
  it('properly stores the session id when the tracked site is embedded in an iframe', () => {
    const sessionIds: string[] = []

    cy.interceptGravityPublish((req) => {
      if (req.url.includes('5678')) {
        req.body.forEach((sessionUserAction: { sessionId: string }) => {
          sessionIds.push(sessionUserAction.sessionId)
        })
      }
    })

    cy.openBaseSite('iframeEmbedding.html')
    getIframeBody().find('a.simple-link').should('have.text', 'A simple link which does nothing').click()

    cy.wait('@sendGravityRequest').then((interception) => {
      expect(sessionIds.length).to.greaterThan(1)

      const uniqueSessionIds = new Set(sessionIds)
      expect(uniqueSessionIds.size).to.eq(1)
    })
  })
})

const getIframeDocument = () => {
  return (
    cy
      .get('iframe[data-cy="the-iframe"]')
      // Cypress yields jQuery element, which has the real
      // DOM element under property "0".
      // From the real DOM iframe element we can get
      // the "document" element, it is stored in "contentDocument" property
      // Cypress "its" command can access deep properties using dot notation
      // https://on.cypress.io/its
      .its('0.contentDocument')
      .should('exist')
  )
}

const getIframeBody = () => {
  // get the document
  return (
    getIframeDocument()
      // automatically retries until body is loaded
      .its('body')
      .should('not.be.undefined')
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      .then(cy.wrap)
  )
}
