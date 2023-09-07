"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCheckableElement = void 0;
function isCheckableElement(element) {
    switch (element.type) {
        case 'checkbox':
        case 'radio':
            return true;
        default:
            return false;
    }
}
exports.isCheckableElement = isCheckableElement;
