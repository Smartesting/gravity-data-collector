export default function getHTMLElementAttributes(element: HTMLElement): Record<string, string> {
  const attributeNames = element.getAttributeNames()

  return attributeNames.reduce<Record<string, string>>((attributes, attributeName) => {
    attributes[attributeName] = element.getAttribute(attributeName) ?? ''
    return attributes
  }, {})
}
