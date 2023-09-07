"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ISessionIdHandler_1 = require("./ISessionIdHandler");
var MemorySessionIdHandler = /** @class */ (function (_super) {
    __extends(MemorySessionIdHandler, _super);
    function MemorySessionIdHandler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sessionTimeout = new Date().getTime() - 1;
        return _this;
    }
    MemorySessionIdHandler.prototype.getSessionId = function () {
        return this.sessionId;
    };
    MemorySessionIdHandler.prototype.setSessionId = function (sessionId) {
        this.sessionId = sessionId;
    };
    MemorySessionIdHandler.prototype.getTimeout = function () {
        return this.sessionTimeout;
    };
    MemorySessionIdHandler.prototype.setTimeout = function (timeout) {
        this.sessionTimeout = timeout;
    };
    return MemorySessionIdHandler;
}(ISessionIdHandler_1.BaseSessionIdHandler));
exports.default = MemorySessionIdHandler;
