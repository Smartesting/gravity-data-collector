import { HTMLInputWithValue } from '../types'

const CRITICAL_INPUT_TYPES = ['textarea', 'text', 'number', 'hidden', 'url', 'tel', 'password', 'email', 'file']

export function sanitizeHTMLElementValue(element: HTMLInputWithValue) {
  if (CRITICAL_INPUT_TYPES.includes(element.type)) {
    return `{{${getInputType(element)}}}`
  }
  switch (element.type) {
    case 'checkbox':
    case 'radio':
      return (element as HTMLInputElement).checked.toString()
    default:
      return element.value
  }
}

function getInputType(element: HTMLInputWithValue) {
  return element.tagName.toLowerCase() === 'input' ? element.type : element.tagName.toLowerCase()
}
