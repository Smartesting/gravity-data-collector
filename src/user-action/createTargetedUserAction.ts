import unique from 'unique-selector'
import {
  ClickUserActionData,
  CreateSelectorsOptions,
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
import { createSelectors } from '../utils/createSelectors'

interface CreateTargetedUserActionOptions {
  selectorsOptions: Partial<CreateSelectorsOptions> | undefined
  excludeRegex: RegExp | null
  customSelector: string | undefined
  document: Document
}

const createTargetedUserActionDefaultOptions: CreateTargetedUserActionOptions = {
  selectorsOptions: undefined,
  excludeRegex: null,
  customSelector: undefined,
  document: getDocument(),
}

export function createTargetedUserAction(
  event: Event,
  type: UserActionType,
  customOptions?: Partial<CreateTargetedUserActionOptions>,
): TargetedUserAction | null {
  const options = {
    ...createTargetedUserActionDefaultOptions,
    ...customOptions,
  }

  const target = event.target as HTMLElement
  if (target === null || target === undefined || event.target === options.document) return null

  const userAction: TargetedUserAction = {
    type,
    target: createActionTarget(target, options),
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

function createActionTarget(target: HTMLElement | Window, options: CreateTargetedUserActionOptions): UserActionTarget {
  const { customSelector, document, selectorsOptions } = options
  const element = isHtmlElement(target) ? target.tagName.toLocaleLowerCase() : 'window'
  const actionTarget: UserActionTarget = { element }

  if (isHtmlElement(target)) {
    const type = target.getAttribute('type')
    if (type !== null) actionTarget.type = type

    if (isCheckableElement(target)) {
      actionTarget.value = (target as HTMLInputElement).checked.toString()
    }

    actionTarget.selectors = createSelectors(target, selectorsOptions)

    const customSelectorAttribute = customSelector !== undefined ? target.getAttribute(customSelector) : null

    if (customSelectorAttribute !== null) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      actionTarget.selector = `[${customSelector}=${customSelectorAttribute}]`
    } else {
      try {
        actionTarget.selector = unique(target, { excludeRegex: options.excludeRegex })
      } catch {
        // ignore
      }
    }

    const displayInfo = createTargetDisplayInfo(target, document)
    if (displayInfo !== undefined) actionTarget.displayInfo = displayInfo
  }

  return actionTarget
}

function isHtmlElement(tbd: unknown): tbd is HTMLElement {
  return (tbd as HTMLElement).tagName !== undefined
}
