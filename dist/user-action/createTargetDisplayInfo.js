"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTargetDisplayInfo = void 0;
var getDocument_1 = __importDefault(require("../utils/getDocument"));
function createTargetDisplayInfo(element, document) {
    if (document === void 0) { document = (0, getDocument_1.default)(); }
    switch (element.tagName.toLowerCase()) {
        case 'a':
        case 'button':
            return createHtmlClickableDisplayInfo(element, document);
        case 'textarea':
        case 'select':
        case 'input':
            return createHTMLInputDisplayInfo(element, document);
        default:
            return undefined;
    }
}
exports.createTargetDisplayInfo = createTargetDisplayInfo;
function createHtmlClickableDisplayInfo(element, document) {
    var displayInfo = {};
    var text = element.textContent;
    if (text !== null && !isEmpty(text))
        displayInfo.text = text;
    var label = findLabelForElement(element, document);
    if (label !== null && !isEmpty(label))
        displayInfo.label = label;
    return displayInfo;
}
function createHTMLInputDisplayInfo(element, document) {
    if (document === void 0) { document = (0, getDocument_1.default)(); }
    var displayInfo = {};
    var placeholder = element.placeholder;
    if (placeholder !== undefined && !isEmpty(placeholder))
        displayInfo.placeholder = placeholder;
    var label = findLabelForElement(element, document);
    if (label !== null && !isEmpty(label))
        displayInfo.label = label;
    if (element.type.toLowerCase() === 'button') {
        if (element.value !== undefined && !isEmpty(element.value))
            displayInfo.text = element.value;
    }
    return displayInfo;
}
function findLabelForElement(element, document) {
    if (document === void 0) { document = (0, getDocument_1.default)(); }
    var id = element.id;
    if (id !== null && !isEmpty(id)) {
        var labels = document.getElementsByTagName('label');
        for (var i = 0; i < labels.length; i++) {
            var label = labels.item(i);
            if (label !== null && label.htmlFor === id) {
                return label.textContent;
            }
        }
    }
    return null;
}
function isEmpty(text) {
    return text.trim().length === 0;
}
