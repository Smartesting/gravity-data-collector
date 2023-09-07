"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRAVITY_SESSION_TRACKING_SUSPENDED = void 0;
exports.GRAVITY_SESSION_TRACKING_SUSPENDED = 'gravity-session-tracking-suspended';
var TrackingHandler = /** @class */ (function () {
    function TrackingHandler(errorTerminateTracking) {
        this.errorTerminateTracking = errorTerminateTracking;
        this.active = true;
    }
    TrackingHandler.prototype.setActive = function (active) {
        this.active = active;
    };
    TrackingHandler.prototype.activateTracking = function () {
        if (this.eventListenerHandler === undefined) {
            throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.');
        }
        window.sessionStorage.removeItem(exports.GRAVITY_SESSION_TRACKING_SUSPENDED);
        this.eventListenerHandler.initializeEventListeners();
    };
    TrackingHandler.prototype.init = function (eventListenerHandler) {
        this.eventListenerHandler = eventListenerHandler;
        if (this.isTracking()) {
            this.activateTracking();
        }
    };
    TrackingHandler.prototype.isTracking = function () {
        return this.active && window.sessionStorage.getItem(exports.GRAVITY_SESSION_TRACKING_SUSPENDED) !== '1';
    };
    TrackingHandler.prototype.deactivateTracking = function () {
        if (this.eventListenerHandler === undefined) {
            throw new Error('Tracking Handler has not been initialized properly. Call the init() method beforehand.');
        }
        window.sessionStorage.setItem(exports.GRAVITY_SESSION_TRACKING_SUSPENDED, '1');
        this.eventListenerHandler.terminateEventListeners();
    };
    TrackingHandler.prototype.senderErrorCallback = function (statusCode) {
        if (this.errorTerminateTracking.includes(statusCode)) {
            this.deactivateTracking();
        }
    };
    TrackingHandler.prototype.getSenderErrorCallback = function () {
        return this.senderErrorCallback.bind(this);
    };
    return TrackingHandler;
}());
exports.default = TrackingHandler;
