"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingUrlStartPart = exports.buildGravityTrackingIdentifySessionApiUrl = exports.buildGravityTrackingPublishApiUrl = exports.GRAVITY_SERVER_ADDRESS = void 0;
exports.GRAVITY_SERVER_ADDRESS = 'https://api.gravity.smartesting.com';
function buildGravityTrackingPublishApiUrl(authKey, gravityServerUrl) {
    return "".concat(trackingUrlStartPart(gravityServerUrl), "/").concat(authKey, "/publish");
}
exports.buildGravityTrackingPublishApiUrl = buildGravityTrackingPublishApiUrl;
function buildGravityTrackingIdentifySessionApiUrl(authKey, gravityServerUrl, sessionId) {
    return "".concat(trackingUrlStartPart(gravityServerUrl), "/").concat(authKey, "/identify/").concat(sessionId);
}
exports.buildGravityTrackingIdentifySessionApiUrl = buildGravityTrackingIdentifySessionApiUrl;
function trackingUrlStartPart(gravityServerUrl) {
    return "".concat(gravityServerUrl, "/api/tracking");
}
exports.trackingUrlStartPart = trackingUrlStartPart;
