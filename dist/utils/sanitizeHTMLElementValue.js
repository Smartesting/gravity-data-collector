"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHTMLElementValue = void 0;
var INPUT_TYPES_SKIPPING_SANITIZING = ['color', 'button', 'reset', 'submit'];
function sanitizeHTMLElementValue(element) {
    if (INPUT_TYPES_SKIPPING_SANITIZING.includes(element.type)) {
        return element.value;
    }
    switch (element.type) {
        case 'checkbox':
        case 'radio':
            return element.checked.toString();
        default:
            return "{{".concat(getInputType(element), "}}");
    }
}
exports.sanitizeHTMLElementValue = sanitizeHTMLElementValue;
function getInputType(element) {
    return element.tagName.toLowerCase() === 'input' ? element.type : element.tagName.toLowerCase();
}
