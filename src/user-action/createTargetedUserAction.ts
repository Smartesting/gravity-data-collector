import {
  CLICKABLE_ELEMENT_TAG_NAMES,
  CreateSelectorsOptions,
  ElementPosition,
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

export interface CreateTargetedUserActionOptions {
  selectorsOptions: Partial<CreateSelectorsOptions> | undefined
  document: Document
}

const CREATE_TARGETED_USER_ACTION_DEFAULT_OPTIONS: CreateTargetedUserActionOptions = {
  selectorsOptions: undefined,
  document: getDocument(),
}

export function createTargetedUserAction(
  event: Event,
  type: UserActionType,
  customOptions?: Partial<CreateTargetedUserActionOptions>,
): TargetedUserAction | null {
  const options = {
    ...CREATE_TARGETED_USER_ACTION_DEFAULT_OPTIONS,
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

  const targetedUserAction: TargetedUserAction = {
    type,
    target: createActionTarget(target, options),
    location: location(),
    document: gravityDocument(),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(),
    userActionData,
  }
  if (type === UserActionType.Click) {
    const interactiveTarget = target.closest(CLICKABLE_ELEMENT_TAG_NAMES.join(','))
    if (interactiveTarget && interactiveTarget !== target) {
      targetedUserAction.interactiveTarget = createActionTarget(interactiveTarget as HTMLElement, options)
    }
  }
  return targetedUserAction
}

function hasGetBoundingClientRect(target: HTMLElement): boolean {
  return target.getBoundingClientRect !== undefined
}

function getTargetActionData(target: HTMLElement): TargetActionData {
  return {
    elementPosition: getElementPosition(target),
    scrollableAncestors: getScrollableAncestors(target),
  }
}

function getScrollableAncestors(target: HTMLElement): ReadonlyArray<ScrollableAncestor> {
  const { scrollTop, scrollLeft, parentElement } = target
  const scrollableAncestors = parentElement ? getScrollableAncestors(parentElement) : []

  if (scrollTop > 0 || scrollLeft > 0) {
    const scrollable: ScrollableAncestor = {
      elementPosition: getElementPosition(target),
      scrollX: Math.trunc(scrollLeft),
      scrollY: Math.trunc(scrollTop),
      selectors: createSelectors(target),
    }
    return [...scrollableAncestors, scrollable]
  }

  return scrollableAncestors
}

function getElementPosition(target: HTMLElement): ElementPosition {
  const targetOffset = target.getBoundingClientRect()

  return {
    offsetTop: Math.trunc(target.offsetTop),
    offsetLeft: Math.trunc(target.offsetLeft),
    boundingOffsetTop: Math.trunc(target.offsetTop),
    boundingOffsetLeft: Math.trunc(target.offsetLeft),
    width: Math.trunc(targetOffset.width),
    height: Math.trunc(targetOffset.height),
  }
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
  const { document, selectorsOptions } = options
  const element = isHtmlElement(target) ? target.tagName.toLocaleLowerCase() : 'window'
  const actionTarget: UserActionTarget = { element }

  if (isHtmlElement(target)) {
    const type = target.getAttribute('type')
    if (type !== null) actionTarget.type = type

    if (isCheckableElement(target)) {
      actionTarget.value = (target as HTMLInputElement).checked.toString()
    }

    actionTarget.selectors = createSelectors(target, selectorsOptions)

    const displayInfo = createTargetDisplayInfo(target, { anonymize: false }, document)
    if (displayInfo !== undefined) actionTarget.displayInfo = displayInfo
  }

  return actionTarget
}

function isHtmlElement(tbd: unknown): tbd is HTMLElement {
  return (tbd as HTMLElement).tagName !== undefined
}
