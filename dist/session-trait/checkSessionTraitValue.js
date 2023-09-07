"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSessionTraitValue = exports.preventBadSessionTraitValue = void 0;
var types_1 = require("../types");
function preventBadSessionTraitValue(value) {
    if (!checkSessionTraitValue(value)) {
        console.warn('[Gravity Data Collector] The following session trait value is not allowed: ', value);
        return false;
    }
    return true;
}
exports.preventBadSessionTraitValue = preventBadSessionTraitValue;
function checkSessionTraitValue(value) {
    if (value === undefined || value === null)
        return false;
    var type = typeof value;
    if (!types_1.ALLOWED_SESSION_TRAIT_VALUE_TYPES.includes(type)) {
        return false;
    }
    return !(type === 'string' && value.length > 255);
}
exports.checkSessionTraitValue = checkSessionTraitValue;
