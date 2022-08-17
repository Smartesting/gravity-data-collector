import { TargetDisplayInfo } from '../types'

export function createTargetDisplayInfo(
  element: HTMLElement,
  document: Document = global.document,
): TargetDisplayInfo | undefined {
  const displayInfo: TargetDisplayInfo = {}

  const text = element.textContent

  switch (element.tagName.toLowerCase()) {
    case 'a':
    case 'button':
      if (text !== null && !isEmpty(text)) displayInfo.text = text
      return displayInfo
    case 'textarea':
    case 'select':
    case 'input':
      return createHTMLInputDisplayInfo(element as HTMLInputElement, document)
    case 'body':
    case 'html':
    default:
      return undefined
  }
}

function createHTMLInputDisplayInfo(
  element: HTMLInputElement,
  document: Document = global.document,
): TargetDisplayInfo | undefined {
  const displayInfo: TargetDisplayInfo = {}
  const placeholder = element.placeholder

  const label = findLabelForElement(element, document)
  if (label !== null && !isEmpty(label)) displayInfo.label = label

  switch (element.type.toLowerCase()) {
    case 'button':
      if (element.value !== undefined && !isEmpty(element.value)) displayInfo.text = element.value
      break
    default:
      if (placeholder !== undefined && !isEmpty(placeholder)) displayInfo.placeholder = placeholder
      break
  }
  return displayInfo
}

function findLabelForElement(element: HTMLElement, document: Document = global.document): string | null {
  const id = element.id
  if (id !== null) {
    const labels = document.getElementsByTagName('label')
    for (let i = 0; i < labels.length; i++) {
      const label = labels.item(i)
      if (label !== null && label.htmlFor === id) {
        return label.textContent
      }
    }
  }
  return null
}

function isEmpty(text: string): boolean {
  return text.trim().length === 0
}
