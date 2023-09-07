"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isTargetedUserAction(userAction) {
    return userAction.target !== undefined;
}
exports.default = isTargetedUserAction;
