"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSessionIdHandler = void 0;
var BaseSessionIdHandler = /** @class */ (function () {
    function BaseSessionIdHandler(makeSessionId, sessionDuration) {
        this.makeSessionId = makeSessionId;
        this.sessionDuration = sessionDuration;
    }
    BaseSessionIdHandler.prototype.get = function () {
        var sessionId = this.getSessionId();
        if (sessionId === undefined || new Date().getTime() > this.getTimeout()) {
            sessionId = this.makeSessionId();
            this.setSessionId(sessionId);
        }
        this.setTimeout(new Date().getTime() + this.sessionDuration);
        return sessionId;
    };
    BaseSessionIdHandler.prototype.isSet = function () {
        return this.getSessionId() !== undefined;
    };
    BaseSessionIdHandler.prototype.generateNewSessionId = function () {
        this.setSessionId(this.makeSessionId());
    };
    return BaseSessionIdHandler;
}());
exports.BaseSessionIdHandler = BaseSessionIdHandler;
