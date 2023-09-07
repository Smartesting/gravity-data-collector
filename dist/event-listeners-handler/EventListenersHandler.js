"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventListenersHandler = /** @class */ (function () {
    function EventListenersHandler(eventListeners) {
        this.eventListeners = eventListeners;
    }
    EventListenersHandler.prototype.initializeEventListeners = function () {
        this.eventListeners.forEach(function (eventListener) { return eventListener.init(); });
    };
    EventListenersHandler.prototype.terminateEventListeners = function () {
        this.eventListeners.forEach(function (eventListener) { return eventListener.terminate(); });
    };
    return EventListenersHandler;
}());
exports.default = EventListenersHandler;
