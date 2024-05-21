import { AnonymizationSettings, HTMLInputWithValue } from '../types'
import elementShouldBeAnonymized from './elementShouldBeAnonymized'

export function sanitizeHTMLElementValue(element: HTMLInputWithValue, anonymizationSettings: AnonymizationSettings) {
  if (getInputType(element) === 'password') return '{{hidden}}'

  const anonymize = elementShouldBeAnonymized(element, anonymizationSettings)
  return anonymize ? '{{hidden}}' : element.value
}

function getInputType(element: HTMLInputWithValue) {
  return element.tagName.toLowerCase() === 'input' ? element.type : element.tagName.toLowerCase()
}
