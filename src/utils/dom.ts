import { getCssSelector } from 'css-selector-generator'
import unique from 'unique-selector'
import getDocument from './getDocument'

export function isCheckableElement(element: HTMLElement) {
  switch ((element as HTMLInputElement).type) {
    case 'checkbox':
    case 'radio':
      return true
    default:
      return false
  }
}

export function isFormRelated(element: any) {
  return element.form !== undefined
}

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

export function getXPath(element: any): string {
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

export function createSelectors(
  target: HTMLElement,
  excludeRegex: RegExp | null = null,
  customSelector?: string,
  document: Document = null
): string[] {
  const selectors: string[] = []

  const customSelectorAttribute = customSelector !== undefined ? target.getAttribute(customSelector) : null

  if (customSelectorAttribute !== null) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    selectors.push(`[${customSelector}=${customSelectorAttribute}]`)
  }

  try {
    addSelector(
      getCssSelector(<Element>target, {
        selectors: ['id', 'class', 'tag', 'attribute'],
        blacklist: BLACKLIST,
        combineBetweenSelectors: true,
        maxCandidates: 80,
        maxCombinations: 80,
        root:document?.body || null
      }),
      selectors,
    )

    addSelector(
      getCssSelector(<Element>target, {
        selectors: ['class', 'attribute', 'tag'],
        blacklist: BLACKLIST,
        combineBetweenSelectors: true,
        maxCandidates: 80,
        maxCombinations: 80,
        root: document?.body || null
      }),
      selectors,
    )

    addSelector(
      getCssSelector(<Element>target, {
        selectors: ['tag'],
        blacklist: BLACKLIST,
        combineBetweenSelectors: true,
        maxCandidates: 80,
        maxCombinations: 80,
        root:document?.body || null
      }),
      selectors,
    )

    addSelector(unique(target, { excludeRegex }), selectors)
  } catch {}
  return selectors
}

function addSelector(selector: string, selectors: string[]) {
  if (selectors.indexOf(selector) === -1) selectors.push(selector)
}
