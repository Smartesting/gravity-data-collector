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
var sanitizeHTMLElementValue_1 = require("../utils/sanitizeHTMLElementValue");
var TargetedEventListener_1 = __importDefault(require("./TargetedEventListener"));
var listeners_1 = require("../utils/listeners");
var ChangeEventListener = /** @class */ (function (_super) {
    __extends(ChangeEventListener, _super);
    function ChangeEventListener(userActionHandler, window, options) {
        if (options === void 0) { options = {}; }
        return _super.call(this, userActionHandler, types_1.UserActionType.Change, window, options) || this;
    }
    ChangeEventListener.prototype.listener = function (event) {
        if ((0, listeners_1.isTextField)(event.target))
            return;
        var elementTarget = event.target;
        var userAction = (0, createTargetedUserAction_1.createTargetedUserAction)(event, this.userActionType, this.options);
        if (userAction != null) {
            userAction.target.value = (0, sanitizeHTMLElementValue_1.sanitizeHTMLElementValue)(elementTarget);
            this.userActionHandler.handle(userAction);
        }
    };
    return ChangeEventListener;
}(TargetedEventListener_1.default));
exports.default = ChangeEventListener;
