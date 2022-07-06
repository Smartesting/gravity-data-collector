export function getHTMLElementAttributes(element: HTMLElement) {
    const attributeNames = element.getAttributeNames();

    return attributeNames.reduce<Record<string, string>>((attributes, attributeName) => {
        attributes[attributeName] = element.getAttribute(attributeName) || "";
        return attributes;
    }, {});
}
