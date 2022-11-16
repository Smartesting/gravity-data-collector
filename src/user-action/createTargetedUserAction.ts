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

export function createTargetedUserAction(
  event: Event,
  type: UserActionType,
  excludeRegex: RegExp | null = null,
  document: Document = getDocument(),
): TargetedUserAction | null {
  const target = event.target as HTMLElement
  if (target === null || target === undefined) return null

  const userAction: TargetedUserAction = {
    type,
    target: createActionTarget(target, excludeRegex, document),
    location: location(),
    document: gravityDocument(),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(),
  }
  const userActionData = createActionData(event, type)
  if (userActionData !== null) {
    userAction.userActionData = userActionData
  }
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

  try {
    actionTarget.selector = unique(target, { excludeRegex })
  } catch {
    // ignore
  }

  const displayInfo = createTargetDisplayInfo(target, document)
  if (displayInfo !== undefined) actionTarget.displayInfo = displayInfo

  return actionTarget
}
