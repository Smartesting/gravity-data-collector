import { HTMLInputWithValue } from '../types'
import { DataAnonymizer } from '../anonymizer/dataAnonymizer'
import { v4 as uuidv4 } from 'uuid'

export function getHTMLElementAttributes(element: HTMLElement) {
  const attributeNames = element.getAttributeNames()

  return attributeNames.reduce<Record<string, string>>((attributes, attributeName) => {
    attributes[attributeName] = element.getAttribute(attributeName) ?? ''
    return attributes
  }, {})
}

export function anonymizeInputValue(element: HTMLInputWithValue): string {
  const anonymizer = new DataAnonymizer(uuidv4())

  switch (element.type) {
    case 'checkbox':
      return (!!element.getAttribute('checked')).toString()
    case 'email':
      return anonymizer.anonymize(element.value)
    case 'file':
      return anonymizer.anonymize(element.value)
    case 'password':
      return '[[PASSWORD]]'
    case 'search':
      return element.value
    case 'text':
      return anonymizer.anonymize(element.value)
    case 'tel':
      return anonymizer.anonymize(element.value)
    case 'url':
      return anonymizer.anonymize(element.value)
    default:
      return anonymizer.anonymize(element.value)
  }
}
