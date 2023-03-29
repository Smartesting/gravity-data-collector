import unique from 'unique-selector'
import {
  ClickUserActionData,
  KeyUserActionData,
  TargetedUserAction,
  UserActionData,
  UserActionTarget,
  UserActionType,
} from '../types'
import { isCheckableElement } from '../utils/dom'
import gravityDocument from '../utils/gravityDocument'
import viewport from '../utils/viewport'
import location from '../utils/location'
import { createTargetDisplayInfo } from './createTargetDisplayInfo'
import getDocument from '../utils/getDocument'
import { CHANGE_EVENT_INITIATOR } from '../event-listeners/ChangeEventInitiatorHandler'

function getCypressSelector(target: HTMLElement): string | undefined {
  const cypress: Cypress.Cypress & CyEventEmitter = (window as any).Cypress ?? undefined
  if (cypress === undefined) return undefined
  const el = cypress.$(target)
  return cypress.SelectorPlayground.getSelector(el)
}

export function createTargetedUserAction(
  event: Event,
  type: UserActionType,
  excludeRegex: RegExp | null = null,
  customSelector?: string,
  document: Document = getDocument(),
): TargetedUserAction | null {
  const recordedDate = new Date()
  const target = event.target as HTMLElement
  if (target === null || target === undefined || event.target === document) return null
  const cypressSelector = getCypressSelector(target)
  const userAction: TargetedUserAction = {
    type,
    target: createActionTarget(target, excludeRegex, customSelector, document),
    location: location(),
    document: gravityDocument(),
    recordedAt: recordedDate.toISOString(),
    viewportData: viewport(),
    cypressSelector,
  }
  const userActionData = createActionData(event, type)
  if (userActionData !== null) {
    userAction.userActionData = userActionData
  }
  CHANGE_EVENT_INITIATOR.handle(userAction)
  return userAction
}

function createActionData(event: Event, type: UserActionType): UserActionData | null {
  switch (type) {
    case UserActionType.Click:
      return createClickUserActionData(event as MouseEvent)
    case UserActionType.KeyDown:
    case UserActionType.KeyUp:
      return createKeyUserActionData(event as KeyboardEvent)
    default:
      return null
  }
}

function createClickUserActionData(event: MouseEvent): ClickUserActionData {
  const actionData: ClickUserActionData = {
    clickOffsetX: Math.trunc(event.clientX),
    clickOffsetY: Math.trunc(event.clientY),
  }

  const target = event.target as HTMLElement
  if (target !== null) {
    const targetOffset = target.getBoundingClientRect()
    actionData.elementOffsetX = Math.trunc(targetOffset.left)
    actionData.elementOffsetY = Math.trunc(targetOffset.top)
    actionData.elementRelOffsetX = Math.trunc(event.clientX - targetOffset.left)
    actionData.elementRelOffsetY = Math.trunc(event.clientY - targetOffset.top)
  }
  return actionData
}

function createKeyUserActionData(event: KeyboardEvent): KeyUserActionData {
  const { key, code } = event

  return {
    key,
    code,
  }
}

function createActionTarget(
  target: HTMLElement,
  excludeRegex: RegExp | null = null,
  customSelector?: string,
  document: Document = getDocument(),
): UserActionTarget {
  const actionTarget: UserActionTarget = {
    element: target.tagName.toLocaleLowerCase(),
  }

  const type = target.getAttribute('type')
  if (type !== null) actionTarget.type = type

  if (isCheckableElement(target)) {
    actionTarget.value = (target as HTMLInputElement).checked.toString()
  }

  const customSelectorAttribute = customSelector !== undefined ? target.getAttribute(customSelector) : null

  if (customSelectorAttribute !== null) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    actionTarget.selector = `[${customSelector}=${customSelectorAttribute}]`
  } else {
    try {
      actionTarget.selector = unique(target, { excludeRegex })
    } catch {
      // ignore
    }
  }

  const displayInfo = createTargetDisplayInfo(target, document)
  if (displayInfo !== undefined) actionTarget.displayInfo = displayInfo

  return actionTarget
}
