import { TargetDisplayInfo } from '../types'

export function createTargetDisplayInfo(
  element: HTMLElement,
  document: Document = global.document,
): TargetDisplayInfo | undefined {
  switch (element.tagName.toLowerCase()) {
    case 'a':
    case 'button':
      return createHtmlClickableDisplayInfo(element, document)
    case 'textarea':
    case 'select':
    case 'input':
      return createHTMLInputDisplayInfo(element as HTMLInputElement, document)
    default:
      return undefined
  }
}

function createHtmlClickableDisplayInfo(element: HTMLElement, document: Document) {
  const displayInfo: TargetDisplayInfo = {}

  const text = element.textContent
  if (text !== null && !isEmpty(text)) displayInfo.text = text

  const label = findLabelForElement(element, document)
  if (label !== null && !isEmpty(label)) displayInfo.label = label

  return displayInfo
}

function createHTMLInputDisplayInfo(
  element: HTMLInputElement,
  document: Document = global.document,
): TargetDisplayInfo | undefined {
  const displayInfo: TargetDisplayInfo = {}

  const placeholder = element.placeholder
  if (placeholder !== undefined && !isEmpty(placeholder)) displayInfo.placeholder = placeholder

  const label = findLabelForElement(element, document)
  if (label !== null && !isEmpty(label)) displayInfo.label = label

  if (element.type.toLowerCase() === 'button') {
    if (element.value !== undefined && !isEmpty(element.value)) displayInfo.text = element.value
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