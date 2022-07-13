export function getHTMLElementAttributes(element: HTMLElement) {
  const attributeNames = element.getAttributeNames()

  return attributeNames.reduce<Record<string, string>>((attributes, attributeName) => {
    attributes[attributeName] = element.getAttribute(attributeName) ?? ''
    return attributes
  }, {})
}

export function isInteractiveElement(element: HTMLElement) {
  switch (element.tagName.toLowerCase()) {
    case 'button':
      return true
    case 'a':
      return true
    case 'select':
      return true
    case 'input':
      return true
    default:
      return false
  }
}
