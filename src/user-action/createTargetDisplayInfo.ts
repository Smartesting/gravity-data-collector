import { TargetDisplayInfo } from '../types'
import getDocument from '../utils/getDocument'

export function createTargetDisplayInfo(
  element: HTMLElement,
  document: Document = getDocument(),
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

  const text = element.textContent ?? ''
  if (!isEmpty(text)) displayInfo.text = text

  const label: HTMLLabelElement | null = findLabelForElement(element, document)
  if (label?.textContent && !isEmpty(label.textContent)) {
    displayInfo.label = label.textContent
  }

  return displayInfo
}

function createHTMLInputDisplayInfo(
  element: HTMLInputElement,
  document: Document = getDocument(),
): TargetDisplayInfo | undefined {
  const displayInfo: TargetDisplayInfo = {}

  const placeholder = element.placeholder
  if (placeholder !== undefined && !isEmpty(placeholder)) displayInfo.placeholder = placeholder

  const label = findLabelForElement(element, document)
  if (label !== null && !isEmpty(label.textContent)) {
    displayInfo.label = label.textContent ?? ''
  }

  if (element.type.toLowerCase() === 'button') {
    if (element.value !== undefined && !isEmpty(element.value)) {
      displayInfo.text = element.value ?? ''
    }
  }
  return displayInfo
}

function findLabelForElement(element: HTMLElement, document: Document = getDocument()): HTMLLabelElement | null {
  const id = element.id
  if (id !== null && !isEmpty(id)) {
    const labels = document.getElementsByTagName('label')
    for (let i = 0; i < labels.length; i++) {
      const label = labels.item(i)
      if (label !== null && label.htmlFor === id) {
        return label
      }
    }
  }
  return null
}

function isEmpty(text: string | null): boolean {
  return !text || text.trim().length === 0
}
