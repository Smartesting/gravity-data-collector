"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDocument() {
    try {
        return global.document;
    }
    catch (_err) {
        return document;
    }
}
exports.default = getDocument;
