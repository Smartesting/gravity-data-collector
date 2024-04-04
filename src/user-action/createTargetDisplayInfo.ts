import { TargetDisplayInfo } from '../types'
import getDocument from '../utils/getDocument'
import { maskText } from '../utils/rrwebRecordingSettings'
import { matchClosest } from '../utils/cssSelectorUtils'

export function createTargetDisplayInfo(
  element: HTMLElement,
  document: Document = getDocument(),
  anonymizeSelectors?: string,
): TargetDisplayInfo | undefined {
  switch (element.tagName.toLowerCase()) {
    case 'a':
    case 'button':
      return createHtmlClickableDisplayInfo(element, document, anonymizeSelectors)
    case 'textarea':
    case 'select':
    case 'input':
      return createHTMLInputDisplayInfo(element as HTMLInputElement, document, anonymizeSelectors)
    default:
      return undefined
  }
}

function createHtmlClickableDisplayInfo(
  element: HTMLElement,
  document: Document,
  anonymizeSelectors: string | undefined,
) {
  const displayInfo: TargetDisplayInfo = {}

  const text = element.textContent
  if (text !== null && !isEmpty(text)) displayInfo.text = anonymizeText(element, text, anonymizeSelectors)

  const label: HTMLLabelElement | null = findLabelForElement(element, document)
  if (label !== null && !isEmpty(label.textContent)) {
    displayInfo.label = anonymizeText(label, label.textContent, anonymizeSelectors)
  }

  return displayInfo
}

function createHTMLInputDisplayInfo(
  element: HTMLInputElement,
  document: Document = getDocument(),
  anonymizeSelectors: string | undefined,
): TargetDisplayInfo | undefined {
  const displayInfo: TargetDisplayInfo = {}

  const placeholder = element.placeholder
  if (placeholder !== undefined && !isEmpty(placeholder)) displayInfo.placeholder = placeholder

  const label = findLabelForElement(element, document)
  if (label !== null && !isEmpty(label.textContent)) {
    displayInfo.label = anonymizeText(label, label.textContent, anonymizeSelectors)
  }

  if (element.type.toLowerCase() === 'button') {
    if (element.value !== undefined && !isEmpty(element.value)) {
      displayInfo.text = anonymizeText(element, element.value, anonymizeSelectors)
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

function anonymizeText(element: HTMLElement, text: string | null, anonymizeSelectors: string | undefined) {
  if (!text) return ''
  return matchClosest(element, anonymizeSelectors) ? maskText(text) : text
}
