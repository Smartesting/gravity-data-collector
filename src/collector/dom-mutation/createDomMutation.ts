import { DomMutation } from '../../types'
import { createExtraSelectors, getXPath } from '../../utils/dom'
import location from '../../utils/location'
import gravityDocument from '../../utils/gravityDocument'

function createDomMutations(mutationRecord: MutationRecord[]): DomMutation[] {
  return mutationRecord.map(createDomMutation)
}

function createDomMutation(mutationRecord: MutationRecord): DomMutation {
  return {
    target: createSelectorsAndXpath(mutationRecord.target),
    addedElements: Array.from(mutationRecord.addedNodes).map((node) => createSelectorsAndXpath(node)),
    removedElements: Array.from(mutationRecord.removedNodes).map((node) => createSelectorsAndXpath(node)),
    type: mutationRecord.type,
    location: location(),
    document: gravityDocument(),
    recordedAt: new Date().toISOString(),
  }
}

function createSelectorsAndXpath(node: Node) {
  return [...createExtraSelectors(node as HTMLElement), getXPath(node as HTMLElement)]
}

export { createDomMutations, createDomMutation }
