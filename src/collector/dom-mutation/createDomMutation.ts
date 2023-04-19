import { DomMutation } from '../../types'
import { createSelectors, getXPath } from '../../utils/dom'

function createDomMutations(mutationRecord: MutationRecord[]): DomMutation[] {
  return mutationRecord.map(createDomMutation)
}

function createDomMutation(mutationRecord: MutationRecord): DomMutation {
  return {
    target: createSelectorsAndXpath(mutationRecord.target),
    addedElements: Array.from(mutationRecord.addedNodes).map((node) => createSelectorsAndXpath(node)),
    removedElements: Array.from(mutationRecord.removedNodes).map((node) => createSelectorsAndXpath(node)),
    type: mutationRecord.type,
  }
}

function createSelectorsAndXpath(node: Node) {
  return [...createSelectors(node as HTMLElement), getXPath(node as HTMLElement)]
}

export { createDomMutations, createDomMutation }
