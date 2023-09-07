"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function windowExists() {
    try {
        return window !== null && window !== undefined;
    }
    catch (err) {
        // We can safely assume that, if we get here, there's no Window reference.
        return false;
    }
}
exports.default = windowExists;
