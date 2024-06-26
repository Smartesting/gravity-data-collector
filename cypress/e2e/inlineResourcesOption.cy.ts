import ITextCompressor from '../../src/text-compressor/ITextCompressor'
import FFLateCompressor from '../../src/text-compressor/FFlateCompressor'
import { CyHttpMessages } from 'cypress/types/net-stubbing'
import IncomingHttpRequest = CyHttpMessages.IncomingHttpRequest

describe('Inline resources data collector option', () => {
  describe('when "inlineResources" is true', () => {
    before(() => {
      cy.task('setCollectorOptions', { inlineResources: true })
    })

    it('stores the recorded snapshot style into the snapshot DOM', () => {
      const snapshotRequests: IncomingHttpRequest[] = []
      cy.interceptGravitySnapshot((req) => snapshotRequests.push(req))
      cy.openBaseSite('form/')
      cy.get('#text-input').type('Some content')
      cy.get('#send-form-button').click()
      cy.wait('@sendGravitySnapshot').then(() => {
        expect(snapshotRequests.length).to.be.gte(1)
        const compressedSnapshotContent = snapshotRequests[0].body.content
        const textCompressor: ITextCompressor = FFLateCompressor
        const snapshotContent = textCompressor.decompress(compressedSnapshotContent)
        expect(snapshotContent).includes('<style>')
      })
    })
  })

  describe('when "inlineResources" is false', () => {
    before(() => {
      return cy.task('setCollectorOptions', { inlineResources: false })
    })

    it('adds a link to the recorded snapshot style into the snapshot DOM', () => {
      const snapshotRequests: IncomingHttpRequest[] = []
      cy.interceptGravitySnapshot((req) => snapshotRequests.push(req))
      cy.openBaseSite('form/')
      cy.get('#text-input').type('Some content')
      cy.get('#send-form-button').click()
      cy.wait('@sendGravitySnapshot').then(() => {
        expect(snapshotRequests.length).to.be.gte(1)
        const compressedSnapshotContent = snapshotRequests[0].body.content
        const textCompressor: ITextCompressor = FFLateCompressor
        const snapshotContent = textCompressor.decompress(compressedSnapshotContent)
        expect(snapshotContent).not.includes('<style>')
        expect(snapshotContent).includes('<link rel="stylesheet"')
      })
    })
  })
})
