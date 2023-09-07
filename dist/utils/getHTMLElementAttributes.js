"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getHTMLElementAttributes(element) {
    var attributeNames = element.getAttributeNames();
    return attributeNames.reduce(function (attributes, attributeName) {
        var _a;
        attributes[attributeName] = (_a = element.getAttribute(attributeName)) !== null && _a !== void 0 ? _a : '';
        return attributes;
    }, {});
}
exports.default = getHTMLElementAttributes;
