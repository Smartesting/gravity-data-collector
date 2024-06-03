import { AnonymizationSettings, TargetDisplayInfo } from '../types'
import getDocument from '../utils/getDocument'
import maskText from '../utils/maskText'
import elementShouldBeAnonymized from '../utils/elementShouldBeAnonymized'

export function createTargetDisplayInfo(
  element: HTMLElement,
  anonymizationSettings: AnonymizationSettings,
  document: Document = getDocument(),
): TargetDisplayInfo | undefined {
  const anonymize = elementShouldBeAnonymized(element, anonymizationSettings)

  switch (element.tagName.toLowerCase()) {
    case 'a':
    case 'button':
      return anonymizeTargetDisplayInfo(createHtmlClickableDisplayInfo(element, document), anonymize)
    case 'textarea':
    case 'select':
    case 'input':
      return anonymizeTargetDisplayInfo(createHTMLInputDisplayInfo(element as HTMLInputElement, document), anonymize)
    default:
      return undefined
  }
}

function anonymizeTargetDisplayInfo(
  targetDisplayInfo: TargetDisplayInfo | undefined,
  anonymize: boolean,
): TargetDisplayInfo | undefined {
  if (!anonymize || !targetDisplayInfo) return targetDisplayInfo

  return {
    label: targetDisplayInfo.label ? maskText(targetDisplayInfo.label) : undefined,
    placeholder: targetDisplayInfo.placeholder ? maskText(targetDisplayInfo.placeholder) : undefined,
    text: targetDisplayInfo.text ? maskText(targetDisplayInfo.text) : undefined,
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
    const label = document.querySelector(`label[for=${id}]`) as HTMLLabelElement
    if (label) return label
  }
  return null
}

function isEmpty(text: string | null): boolean {
  return !text || text.trim().length === 0
}
