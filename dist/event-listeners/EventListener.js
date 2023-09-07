"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventListener = /** @class */ (function () {
    function EventListener(userActionHandler, userActionType, window) {
        this.userActionHandler = userActionHandler;
        this.userActionType = userActionType;
        this.window = window;
        this.listenerBind = this.listener.bind(this);
    }
    EventListener.prototype.init = function () {
        this.window.addEventListener(this.userActionType, this.listenerBind, true);
    };
    EventListener.prototype.terminate = function () {
        this.window.removeEventListener(this.userActionType, this.listenerBind, true);
    };
    return EventListener;
}());
exports.default = EventListener;
