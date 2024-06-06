import { Listener } from '../../src/types'

describe('Handling input Changes', () => {
  let sessionUserActionTypes: any[] = []
  const inputIds = ['text-input', 'search-input', 'textarea']

  beforeEach(() => {
    cy.task('setCollectorOptions', { enabledListeners: [Listener.Change] })
    sessionUserActionTypes = []

    cy.interceptGravityPublish((req) => {
      const { body } = req

      for (const sessionUserAction of body) {
        sessionUserActionTypes.push(sessionUserAction.type)
      }
    })
  })

  for (const inputId of inputIds) {
    it(`triggers a change event when ${inputId} is left`, () => {
      cy.openBaseSite('form/')
      cy.get(`#${inputId}`)
        .type('Some content')
        .blur()
        .then(() => {
          cy.wait('@sendGravityRequest').then(() => {
            cy.wait(500).then(() => {
              const changes = sessionUserActionTypes.filter((type) => type === 'change')

              expect(changes.length).to.eq(1)
            })
          })
        })
    })
  }
})
