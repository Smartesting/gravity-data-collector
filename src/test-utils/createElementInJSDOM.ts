import { JSDOM } from 'jsdom'

export default function createElementInJSDOM(
  elementHTML: string,
  querySelector: string,
  dom: JSDOM = new JSDOM(),
): {
  element: HTMLElement
  domWindow: Window
} {
  //dom = new JSDOM(elementHTML)

  const body = dom.window.document.createElement('body')
  dom.window.document.body = body
  body.insertAdjacentHTML('beforeend', elementHTML.trim())

  const element = dom.window.document.querySelector(querySelector)
  if (dom.window.document.querySelector(querySelector) == null)
    throw new Error(`Element not found with query "${querySelector}" in dom: "${elementHTML}"`)

  return {
    element: element as HTMLElement,
    domWindow: dom.window as unknown as Window,
  }
}
