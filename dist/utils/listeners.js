"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTargetAllowedByKeyListeners = exports.isKeyAllowedByKeyListeners = exports.recordChangeEvent = exports.isTextField = void 0;
var TAG_NAME_DISALLOWED_BY_KEY_LISTENERS = ['textarea'];
var INPUT_ALLOWED_BY_KEY_LISTENERS = ['radio', 'select', 'checkbox', 'button'];
var KEYS_ALLOWED_BY_KEY_LISTENERS = ['tab', 'enter', 'numpadenter'];
var NON_TEXT_KEYS = [
    'tab',
    'enter',
    'numpadenter',
    'esc',
    'controlleft',
    'controlright',
    'altleft',
    'altright',
    'metaright',
    'metaleft',
    'shiftright',
    'shiftleft',
    'capslock',
];
function isTextField(target) {
    if (target === null)
        return false;
    var elementTarget = target;
    var inputElementTarget = target;
    if (INPUT_ALLOWED_BY_KEY_LISTENERS.includes(inputElementTarget.type))
        return false;
    return elementTarget.tagName.toLowerCase() === 'input' || elementTarget.tagName.toLowerCase() === 'textarea';
}
exports.isTextField = isTextField;
function recordChangeEvent(keyCode, target) {
    if (keyCode === undefined)
        return false;
    if (target === null)
        return false;
    if (!isTextField(target))
        return false;
    return !NON_TEXT_KEYS.includes(keyCode.toLowerCase());
}
exports.recordChangeEvent = recordChangeEvent;
function isKeyAllowedByKeyListeners(keyCode) {
    return keyCode !== undefined && KEYS_ALLOWED_BY_KEY_LISTENERS.includes(keyCode.toLowerCase());
}
exports.isKeyAllowedByKeyListeners = isKeyAllowedByKeyListeners;
function isTargetAllowedByKeyListeners(target) {
    if (target === null)
        return true;
    var elementTarget = target;
    var inputElementTarget = target;
    if (TAG_NAME_DISALLOWED_BY_KEY_LISTENERS.includes(elementTarget.tagName.toLowerCase()))
        return false;
    if (elementTarget.tagName.toLowerCase() === 'input') {
        return INPUT_ALLOWED_BY_KEY_LISTENERS.includes(inputElementTarget.type);
    }
    return true;
}
exports.isTargetAllowedByKeyListeners = isTargetAllowedByKeyListeners;
