import { JSDOM } from 'jsdom'

export default function createElementInJSDOM(elementHTML: string, querySelector: string): {
  element: HTMLElement
  domWindow: Window
} {
  const dom = new JSDOM(elementHTML)
  const element = dom.window.document.querySelector(querySelector)
  if (element == null) throw new Error('Element is null')

  return {
    element: element as HTMLElement,
    domWindow: dom.window as unknown as Window,
  }
}
