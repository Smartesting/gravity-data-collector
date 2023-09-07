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
var documentCookie_1 = require("../utils/documentCookie");
var GRAVITY_SESSION_ID_COOKIE_KEY = 'gravity_session_id';
var GRAVITY_SESSION_TIMEOUT_COOKIE_KEY = 'gravity_session_timeout';
var CookieSessionIdHandler = /** @class */ (function (_super) {
    __extends(CookieSessionIdHandler, _super);
    function CookieSessionIdHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CookieSessionIdHandler.prototype.getSessionId = function () {
        return (0, documentCookie_1.readCookie)(GRAVITY_SESSION_ID_COOKIE_KEY);
    };
    CookieSessionIdHandler.prototype.setSessionId = function (sessionId) {
        (0, documentCookie_1.setCookie)(GRAVITY_SESSION_ID_COOKIE_KEY, sessionId);
    };
    CookieSessionIdHandler.prototype.getTimeout = function () {
        var stored = (0, documentCookie_1.readCookie)(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY);
        return stored !== undefined ? parseInt(stored) : new Date().getTime() - 1;
    };
    CookieSessionIdHandler.prototype.setTimeout = function (timeout) {
        (0, documentCookie_1.setCookie)(GRAVITY_SESSION_TIMEOUT_COOKIE_KEY, timeout.toString());
    };
    return CookieSessionIdHandler;
}(ISessionIdHandler_1.BaseSessionIdHandler));
exports.default = CookieSessionIdHandler;
