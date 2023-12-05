import unique from 'unique-selector'
import {
  CreateSelectorsOptions,
  KeyUserActionData,
  MouseActionData,
  ScrollableAncestor,
  TargetActionData,
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

  const userActionData: UserActionData | undefined = hasGetBoundingClientRect(target)
    ? {
        ...getTargetActionData(target),
        ...createActionData(target, event, type),
      }
    : undefined

  return {
    type,
    target: createActionTarget(target, options),
    location: location(),
    document: gravityDocument(),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(),
    userActionData,
  }
}

function hasGetBoundingClientRect(target: HTMLElement): boolean {
  return target.getBoundingClientRect !== undefined
}

function getTargetActionData(target: HTMLElement): TargetActionData {
  const targetOffset = target.getBoundingClientRect()
  return {
    elementOffsetX: Math.trunc(targetOffset.left),
    elementOffsetY: Math.trunc(targetOffset.top),
    elementWidth: Math.trunc(targetOffset.width),
    elementHeight: Math.trunc(targetOffset.height),
    scrollableAncestors: getScrollableAncestors(target),
  }
}

function getScrollableAncestors(target: HTMLElement): ReadonlyArray<ScrollableAncestor> {
  const { scrollTop, scrollLeft, parentElement } = target
  const scrollableAncestors = parentElement ? getScrollableAncestors(parentElement) : []

  if (scrollTop > 0 || scrollLeft > 0) {
    const scrollable: ScrollableAncestor = {
      scrollX: Math.trunc(scrollLeft),
      scrollY: Math.trunc(scrollTop),
      elementHeight: Math.trunc(target.getBoundingClientRect().height),
      elementWidth: Math.trunc(target.getBoundingClientRect().width),
      selectors: createSelectors(target),
    }
    return [...scrollableAncestors, scrollable]
  }

  return scrollableAncestors
}

function createActionData(
  target: HTMLElement,
  event: Event,
  type: UserActionType,
): KeyUserActionData | MouseActionData | {} {
  switch (type) {
    case UserActionType.Click:
    case UserActionType.ContextMenu:
    case UserActionType.DblClick:
    case UserActionType.DragStart:
    case UserActionType.Drop:
      return createMouseActionData(target, event as MouseEvent)
    case UserActionType.KeyDown:
    case UserActionType.KeyUp:
      return createKeyUserActionData(event as KeyboardEvent)
    default:
      return {}
  }
}

function createMouseActionData(target: HTMLElement, event: MouseEvent): MouseActionData | {} {
  const targetOffset = target.getBoundingClientRect()

  return {
    clientX: Math.trunc(event.clientX),
    clientY: Math.trunc(event.clientY),
    elementRelOffsetX: Math.trunc(event.clientX - targetOffset.left),
    elementRelOffsetY: Math.trunc(event.clientY - targetOffset.top),
  }
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
