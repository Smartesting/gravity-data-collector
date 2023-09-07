"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionStartedUserAction = void 0;
var viewport_1 = __importDefault(require("../utils/viewport"));
var location_1 = __importDefault(require("../utils/location"));
var types_1 = require("../types");
var config_1 = require("../config");
var gravityDocument_1 = __importDefault(require("../utils/gravityDocument"));
var makeCypressTestContext_1 = require("../utils/makeCypressTestContext");
function buildId() {
    var _a, _b;
    return ((_b = (_a = rejectBlankString(process.env.GRAVITY_BUILD_ID)) !== null && _a !== void 0 ? _a : rejectBlankString(process.env.REACT_APP_GRAVITY_BUILD_ID)) !== null && _b !== void 0 ? _b : undefined);
}
function rejectBlankString(value) {
    if (value !== undefined && value !== '')
        return value;
    return null;
}
function createSessionStartedUserAction() {
    var action = {
        type: types_1.UserActionType.SessionStarted,
        recordedAt: new Date().toISOString(),
        location: (0, location_1.default)(),
        document: (0, gravityDocument_1.default)(),
        viewportData: (0, viewport_1.default)(),
        version: config_1.config.COLLECTOR_VERSION,
        agent: navigator.userAgent,
        buildId: buildId(),
    };
    var cypress = window.Cypress;
    if ((cypress === null || cypress === void 0 ? void 0 : cypress.currentTest) !== undefined) {
        action.test = cypress.currentTest.titlePath.join(' > ');
    }
    var testContext = (0, makeCypressTestContext_1.makeCypressTestContext)();
    if (testContext != null) {
        action.testContext = testContext;
    }
    return action;
}
exports.createSessionStartedUserAction = createSessionStartedUserAction;
