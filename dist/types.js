"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_SESSION_TRAIT_VALUE_TYPES = exports.QueryType = exports.TestingTool = exports.CypressEvent = exports.UserActionType = exports.sendSessionUserActions = void 0;
var sessionUserActionSender_1 = require("./user-action/sessionUserActionSender");
Object.defineProperty(exports, "sendSessionUserActions", { enumerable: true, get: function () { return sessionUserActionSender_1.sendSessionUserActions; } });
var UserActionType;
(function (UserActionType) {
    UserActionType["SessionStarted"] = "sessionStarted";
    UserActionType["Click"] = "click";
    UserActionType["Change"] = "change";
    UserActionType["KeyUp"] = "keyup";
    UserActionType["KeyDown"] = "keydown";
    UserActionType["AsyncRequest"] = "asyncRequest";
    UserActionType["TestCommand"] = "testCommand";
})(UserActionType = exports.UserActionType || (exports.UserActionType = {}));
var CypressEvent;
(function (CypressEvent) {
    CypressEvent["COMMAND_START"] = "command:start";
    CypressEvent["COMMAND_END"] = "command:end";
})(CypressEvent = exports.CypressEvent || (exports.CypressEvent = {}));
var TestingTool;
(function (TestingTool) {
    TestingTool["CYPRESS"] = "cypress";
    TestingTool["PLAYWRIGHT"] = "playwright";
})(TestingTool = exports.TestingTool || (exports.TestingTool = {}));
var QueryType;
(function (QueryType) {
    QueryType["id"] = "id";
    QueryType["class"] = "class";
    QueryType["tag"] = "tag";
    QueryType["nthChild"] = "nthChild";
    QueryType["attributes"] = "attributes";
})(QueryType = exports.QueryType || (exports.QueryType = {}));
exports.ALLOWED_SESSION_TRAIT_VALUE_TYPES = ['string', 'boolean', 'number'];
