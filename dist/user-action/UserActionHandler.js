"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var UserActionHandler = /** @class */ (function () {
    function UserActionHandler(sessionIdHandler, requestInterval, output, onPublish, userActionHistory) {
        var _this = this;
        this.sessionIdHandler = sessionIdHandler;
        this.requestInterval = requestInterval;
        this.output = output;
        this.onPublish = onPublish;
        this.userActionHistory = userActionHistory;
        this.buffer = [];
        if (requestInterval > 0) {
            this.timer = setInterval(function () {
                void _this.flush();
            }, requestInterval);
        }
    }
    UserActionHandler.prototype.handle = function (action) {
        this.buffer.push(action);
        if (this.userActionHistory !== undefined)
            this.userActionHistory.push(action);
        if (this.timer == null) {
            this.flush();
        }
    };
    UserActionHandler.prototype.flush = function () {
        var _this = this;
        if (this.buffer.length === 0)
            return;
        var sessionUserActions = this.buffer.splice(0).map(function (userAction) { return _this.toSessionUserAction(userAction); });
        this.output(sessionUserActions);
        if (this.onPublish !== undefined)
            this.onPublish(sessionUserActions);
    };
    UserActionHandler.prototype.toSessionUserAction = function (action) {
        return __assign({ sessionId: this.sessionIdHandler.get() }, action);
    };
    return UserActionHandler;
}());
exports.default = UserActionHandler;
