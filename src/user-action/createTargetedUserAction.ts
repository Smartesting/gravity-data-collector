import {
  AnonymizationSettings,
  CLICKABLE_ELEMENT_TAG_NAMES,
  CreateSelectorsOptions,
  DEFAULT_ANONYMIZATION_SETTINGS,
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
import gravityLocation from '../utils/gravityLocation'
import { createTargetDisplayInfo } from './createTargetDisplayInfo'
import { createSelectors } from '../utils/createSelectors'

export interface CreateTargetedUserActionOptions {
  selectorsOptions: Partial<CreateSelectorsOptions> | undefined
  anonymizationSettings: AnonymizationSettings
}

const CREATE_TARGETED_USER_ACTION_DEFAULT_OPTIONS: CreateTargetedUserActionOptions = {
  selectorsOptions: undefined,
  anonymizationSettings: DEFAULT_ANONYMIZATION_SETTINGS,
}

export function createTargetedUserAction(
  windowInstance: Window,
  event: Event,
  type: UserActionType,
  customOptions?: Partial<CreateTargetedUserActionOptions>,
): TargetedUserAction | null {
  const options: CreateTargetedUserActionOptions = {
    selectorsOptions: customOptions?.selectorsOptions ?? CREATE_TARGETED_USER_ACTION_DEFAULT_OPTIONS.selectorsOptions,
    anonymizationSettings:
      customOptions?.anonymizationSettings ?? CREATE_TARGETED_USER_ACTION_DEFAULT_OPTIONS.anonymizationSettings,
  }

  const target = event.target as HTMLElement
  const document = windowInstance.document
  if (target === null || target === undefined || event.target === document) return null
  if (target.closest('.rr-ignore') ?? target.closest('.rr-block')) return null

  const userActionData: UserActionData | undefined = hasGetBoundingClientRect(target)
    ? {
        ...getTargetActionData(target),
        ...createActionData(target, event, type),
      }
    : undefined

  const targetedUserAction: TargetedUserAction = {
    type,
    target: createActionTarget(document, target, options),
    location: gravityLocation(windowInstance.location),
    document: gravityDocument(document),
    recordedAt: new Date().toISOString(),
    viewportData: viewport(windowInstance),
    userActionData,
  }

  if (type === UserActionType.Click) {
    const interactiveTarget = target.closest(CLICKABLE_ELEMENT_TAG_NAMES.join(','))
    if (interactiveTarget && interactiveTarget !== target) {
      targetedUserAction.interactiveTarget = createActionTarget(document, interactiveTarget as HTMLElement, options)
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

function createActionTarget(
  document: Document,
  target: HTMLElement | Window,
  options: CreateTargetedUserActionOptions,
): UserActionTarget {
  const element = isHtmlElement(target) ? target.tagName.toLocaleLowerCase() : 'window'
  const actionTarget: UserActionTarget = { element }

  if (isHtmlElement(target)) {
    const type = target.getAttribute('type')
    if (type !== null) actionTarget.type = type

    if (isCheckableElement(target)) {
      actionTarget.value = (target as HTMLInputElement).checked.toString()
    }

    actionTarget.selectors = createSelectors(target, options.selectorsOptions)

    const displayInfo = createTargetDisplayInfo(target, options.anonymizationSettings, document)
    if (displayInfo !== undefined) actionTarget.displayInfo = displayInfo
  }

  return actionTarget
}

function isHtmlElement(tbd: unknown): tbd is HTMLElement {
  return (tbd as HTMLElement).tagName !== undefined
}
