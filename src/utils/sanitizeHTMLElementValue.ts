import { HTMLInputWithValue } from '../types'

const INPUT_TYPES_SKIPPING_SANITIZING = ['color', 'button', 'reset', 'submit']

export function sanitizeHTMLElementValue(element: HTMLInputWithValue) {
  if (INPUT_TYPES_SKIPPING_SANITIZING.includes(element.type)) {
    return element.value
  }
  switch (element.type) {
    case 'checkbox':
    case 'radio':
      return (element as HTMLInputElement).checked.toString()
    default:
      return `{{${getInputType(element)}}}`
  }
}

function getInputType(element: HTMLInputWithValue) {
  return element.tagName.toLowerCase() === 'input' ? element.type : element.tagName.toLowerCase()
}
