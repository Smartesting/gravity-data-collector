export function checkCssSelector(selector: string | undefined): boolean {
  if (selector === null || selector === undefined) return true
  try {
    document.createDocumentFragment().querySelector(selector)
    return true
  } catch {
    return false
  }
}

export function matchClosest(element: HTMLElement, cssSelector: string | undefined): boolean {
  if (!cssSelector) return false
  try {
    return Boolean(element.closest(cssSelector))
  } catch (e) {
    return false
  }
}
