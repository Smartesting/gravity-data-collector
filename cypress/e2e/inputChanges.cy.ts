describe('Handling input Changes', () => {
  let sessionUserActionTypes: any[] = []
  const inputIds = ['text-input', 'search-input', 'textarea']

  beforeEach(() => {
    cy.clearCookies()
    sessionUserActionTypes = []
    cy.interceptGravitySnapshot()
    cy.interceptGravityRecord()
    cy.interceptGravityPublish((req) => {
      const { body } = req

      for (const sessionUserAction of body) {
        sessionUserActionTypes.push(sessionUserAction.type)
      }
    })
    cy.interceptGravityCollectionSettings()
  })

  for (const inputId of inputIds) {
    it(`triggers a change event when ${inputId} is left`, () => {
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
