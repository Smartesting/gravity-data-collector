export function getHTMLElementAttributes(elt: HTMLElement) {
    const attrList = elt.getAttributeNames();

    return attrList.reduce<Record<string, string>>((acc, attr) => {
        acc[attr] = elt.getAttribute(attr) || "";
        return acc;
    }, {});
}
