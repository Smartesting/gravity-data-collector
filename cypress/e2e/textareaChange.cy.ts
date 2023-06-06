describe('Handling textarea enter as a change', () => {
  beforeEach(() => {
    cy.clearCookies()
  })

  it('when enter is typed in a textarea, it is not considered as a change', () => {
    const sessionUserActions: any[] = []
    cy.interceptGravityPublish((req) => {
      const { body } = req

      for (const sessionUserAction of body) {
        sessionUserActions.push(sessionUserAction)
      }
    })

    cy.openBaseSite()
    cy.get('textarea').type('Ok, this is my first line\n and this is the second one')

    cy.wait('@sendGravityRequest').then(() => {
      expect(sessionUserActions.length).to.eq(4)

      const sessionUserActionTypes = sessionUserActions.map((sessionUserAction) => {
        return sessionUserAction.type
      })
      expect(sessionUserActionTypes).not.to.contain('change')
    })
  })

  it('when a single line is typed in a textarea, no change event is triggered', () => {
    const sessionUserActions: any[] = []
    cy.interceptGravityPublish((req) => {
      const { body } = req

      for (const sessionUserAction of body) {
        sessionUserActions.push(sessionUserAction)
      }
    })

    cy.openBaseSite()
    cy.get('textarea').type('Ok, this is my first line')

    cy.wait('@sendGravityRequest').then(() => {
      expect(sessionUserActions.length).to.eq(2)

      const sessionUserActionTypes = sessionUserActions.map((sessionUserAction) => {
        return sessionUserAction.type
      })
      expect(sessionUserActionTypes).not.to.contain('change')
    })
  })
})
