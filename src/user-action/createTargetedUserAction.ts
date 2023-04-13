import { getCssSelector } from 'css-selector-generator'
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

const BLACKLIST = [
  // /.*data.*/i,
  /.*aifex.*/i,
  /.*over.*/i,
  /.*auto.*/i,
  /.*value.*/i,
  /.*checked.*/i,
  '[placeholder]',
  /.*href.*/i,
  /.*src.*/i,
  /.*onclick.*/i,
  /.*onload.*/i,
  /.*onkeyup.*/i,
  /.*width.*/i,
  /.*height.*/i,
  /.*style.*/i,
  /.*size.*/i,
  /.*maxlength.*/i,
]

export function createTargetedUserAction(
  event: Event,
  type: UserActionType,
  excludeRegex: RegExp | null = null,
  customSelector?: string,
  document: Document = getDocument(),
): TargetedUserAction | null {
  const target = event.target as HTMLElement
  if (target === null || target === undefined || event.target === document) return null

  const userAction: TargetedUserAction = {
    type,
    target: createActionTarget(target, excludeRegex, customSelector, document),
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

/*
  Slightly modified getXPath function, initially from https://github.com/thiagodp/get-xpath
  
  MIT License

  Copyright (c) 2020 Thiago Delgado Pinto

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
 */

function getXPath(element: any): string {
  let nodeElem = element
  let parts: string[] = []
  while (nodeElem && Node.ELEMENT_NODE === nodeElem.nodeType) {
    let nbOfPreviousSiblings = 0
    let hasNextSiblings = false
    let sibling = nodeElem.previousSibling
    while (sibling) {
      if (sibling.nodeType !== Node.DOCUMENT_TYPE_NODE && sibling.nodeName === nodeElem.nodeName) {
        nbOfPreviousSiblings++
      }
      sibling = sibling.previousSibling
    }
    sibling = nodeElem.nextSibling
    while (sibling) {
      if (sibling.nodeName === nodeElem.nodeName) {
        hasNextSiblings = true
        break
      }
      sibling = sibling.nextSibling
    }
    let prefix = nodeElem.prefix ? nodeElem.prefix + ':' : ''
    let nth = nbOfPreviousSiblings || hasNextSiblings ? '[' + (nbOfPreviousSiblings + 1) + ']' : ''
    parts.push(prefix + nodeElem.localName + nth)
    nodeElem = nodeElem.parentNode
  }
  return parts.length ? '/' + parts.reverse().join('/') : ''
}

function createActionTarget(
  target: HTMLElement,
  excludeRegex: RegExp | null = null,
  customSelector?: string,
  document: Document = getDocument(),
): UserActionTarget {
  const actionTarget: UserActionTarget = {
    element: target.tagName.toLocaleLowerCase(),
    xpath: getXPath(target),
  }

  if (excludeRegex !== null) {
    BLACKLIST.push(excludeRegex)
  }

  const type = target.getAttribute('type')
  if (type !== null) actionTarget.type = type

  if (isCheckableElement(target)) {
    actionTarget.value = (target as HTMLInputElement).checked.toString()
  }

  actionTarget.selector = []

  const customSelectorAttribute = customSelector !== undefined ? target.getAttribute(customSelector) : null

  if (customSelectorAttribute !== null) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    actionTarget.selector.push(`[${customSelector}=${customSelectorAttribute}]`)
  }

  try {
    actionTarget.selector.push(
      getCssSelector(<Element>target, {
        selectors: ['id', 'class', 'tag', 'attribute'],
        blacklist: BLACKLIST,
        combineBetweenSelectors: true,
        maxCandidates: 80,
        maxCombinations: 80,
      }),
    )

    actionTarget.selector.push(
      getCssSelector(<Element>target, {
        selectors: ['class', 'tag', 'attribute'],
        blacklist: BLACKLIST,
        combineBetweenSelectors: true,
        maxCandidates: 80,
        maxCombinations: 80,
      }),
    )

    actionTarget.selector.push(
      getCssSelector(<Element>target, {
        selectors: ['tag'],
        blacklist: BLACKLIST,
        includeTag: true,
        combineBetweenSelectors: true,
        maxCandidates: 80,
        maxCombinations: 80,
      }),
    )

    actionTarget.selector.push(unique(target, { excludeRegex }))
  } catch (error) {
    console.error(error)
  }

  const displayInfo = createTargetDisplayInfo(target, document)
  if (displayInfo !== undefined) actionTarget.displayInfo = displayInfo

  return actionTarget
}
