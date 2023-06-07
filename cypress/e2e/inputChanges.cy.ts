describe('Handling Keydown as Changes', () => {
  let sessionUserActionTypes: any[] = []
  const inputIds = ['text-input', 'search-input', 'textarea']

  beforeEach(() => {
    cy.clearCookies()
    sessionUserActionTypes = []

    cy.interceptGravityPublish((req) => {
      const { body } = req

      for (const sessionUserAction of body) {
        sessionUserActionTypes.push(sessionUserAction.type)
      }
    })
  })

  for (const inputId of inputIds) {
    it(`a Change event is recorded when typing in a field ${inputId}`, () => {
      cy.openBaseSite('form/')
      cy.get(`#${inputId}`).type('Some content')

      cy.wait('@sendGravityRequest').then(() => {
        const changes = sessionUserActionTypes.filter((type) => type === 'change')

        expect(changes.length).to.eq(1)
      })
    })

    it(`change event is not duplicated when ${inputId} is left`, () => {
      cy.openBaseSite('form/')
      cy.get(`#${inputId}`).type('Some content')
      cy.get('h1').click()

      cy.wait('@sendGravityRequest').then(() => {
        const changes = sessionUserActionTypes.filter((type) => type === 'change')

        expect(changes.length).to.eq(1)
      })
    })
  }
})
