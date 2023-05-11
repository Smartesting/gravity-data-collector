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

// Note: if [our PR](https://github.com/thiagodp/get-xpath/pull/10) is accepted, this could be
// replaced by getXPath(element, { ignoreId: true })

export default function getXPath(element: any): string {
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
