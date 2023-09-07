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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var createTargetedUserAction_1 = require("../user-action/createTargetedUserAction");
var types_1 = require("../types");
var listeners_1 = require("../utils/listeners");
var TargetedEventListener_1 = __importDefault(require("./TargetedEventListener"));
var isTargetedUserAction_1 = __importDefault(require("../utils/isTargetedUserAction"));
var sanitizeHTMLElementValue_1 = require("../utils/sanitizeHTMLElementValue");
var KeyDownEventListener = /** @class */ (function (_super) {
    __extends(KeyDownEventListener, _super);
    function KeyDownEventListener(userActionHandler, window, userActionHistory, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, userActionHandler, types_1.UserActionType.KeyDown, window, options) || this;
        _this.userActionHistory = userActionHistory;
        return _this;
    }
    KeyDownEventListener.prototype.listener = function (event) {
        var userAction = (0, createTargetedUserAction_1.createTargetedUserAction)(event, this.userActionType, this.options);
        if (userAction === null || this.actionIsTheSameThanLast(userAction))
            return;
        if ((0, listeners_1.recordChangeEvent)(event.code, event.target)) {
            var changeUserAction = (0, createTargetedUserAction_1.createTargetedUserAction)(event, types_1.UserActionType.Change, this.options);
            if (changeUserAction != null && !this.changeActionIsSame(changeUserAction)) {
                changeUserAction.target.value = (0, sanitizeHTMLElementValue_1.sanitizeHTMLElementValue)(event.target);
                return this.userActionHandler.handle(changeUserAction);
            }
        }
        if ((0, listeners_1.isKeyAllowedByKeyListeners)(event.code)) {
            return this.userActionHandler.handle(userAction);
        }
        if ((0, listeners_1.isTargetAllowedByKeyListeners)(event.target)) {
            this.userActionHandler.handle(userAction);
        }
    };
    KeyDownEventListener.prototype.changeActionIsSame = function (changeUserAction) {
        var lastUserAction = this.userActionHistory.getLast();
        if (lastUserAction === undefined)
            return false;
        if (!(0, isTargetedUserAction_1.default)(lastUserAction))
            return false;
        return compareTargetedUserAction(changeUserAction, lastUserAction);
    };
    KeyDownEventListener.prototype.actionIsTheSameThanLast = function (userAction) {
        var lastUserAction = this.userActionHistory.getLast();
        if (lastUserAction === undefined)
            return false;
        if (!(0, isTargetedUserAction_1.default)(lastUserAction))
            return false;
        if (lastUserAction.type !== types_1.UserActionType.KeyDown)
            return false;
        if (!compareTargetedUserAction(lastUserAction, userAction))
            return false;
        var targetedUserAction = lastUserAction;
        if (targetedUserAction.userActionData.key !==
            userAction.userActionData.key) {
            return false;
        }
        return (targetedUserAction.userActionData.code ===
            userAction.userActionData.code);
    };
    return KeyDownEventListener;
}(TargetedEventListener_1.default));
function compareTargetedUserAction(tua1, tua2) {
    return sameJSONObjects(makeMinimalTargetedUserAction(tua1), makeMinimalTargetedUserAction(tua2));
}
function makeMinimalTargetedUserAction(userAction) {
    var type = userAction.type, target = userAction.target;
    var element = target.element, selector = target.selector, selectors = target.selectors;
    return { type: type, target: { element: element, selector: selector, selectors: selectors } };
}
function sameJSONObjects(o1, o2) {
    return JSON.stringify(o1) === JSON.stringify(o2);
}
exports.default = KeyDownEventListener;
