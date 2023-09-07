"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NopUserActionHandler = void 0;
var NopUserActionHandler = /** @class */ (function () {
    function NopUserActionHandler() {
    }
    NopUserActionHandler.prototype.handle = function () { };
    NopUserActionHandler.prototype.flush = function () { };
    return NopUserActionHandler;
}());
exports.NopUserActionHandler = NopUserActionHandler;
