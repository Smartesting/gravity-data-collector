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
var GRAVITY_SESSION_STORAGE_KEY_SESSION_ID = 'gravity-session-id';
var GRAVITY_SESSION_STORAGE_KEY_TIMEOUT = 'gravity-session-timeout';
var SessionStorageSessionIdHandler = /** @class */ (function (_super) {
    __extends(SessionStorageSessionIdHandler, _super);
    function SessionStorageSessionIdHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SessionStorageSessionIdHandler.prototype.getSessionId = function () {
        var _a;
        return (_a = window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID)) !== null && _a !== void 0 ? _a : undefined;
    };
    SessionStorageSessionIdHandler.prototype.setSessionId = function (sessionId) {
        window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_SESSION_ID, sessionId);
    };
    SessionStorageSessionIdHandler.prototype.getTimeout = function () {
        var stored = window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_TIMEOUT);
        return stored !== null ? parseInt(stored) : new Date().getTime() - 1;
    };
    SessionStorageSessionIdHandler.prototype.setTimeout = function (timeout) {
        window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_TIMEOUT, timeout.toString());
    };
    return SessionStorageSessionIdHandler;
}(ISessionIdHandler_1.BaseSessionIdHandler));
exports.default = SessionStorageSessionIdHandler;
