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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTargetedUserAction = void 0;
var unique_selector_1 = __importDefault(require("unique-selector"));
var types_1 = require("../types");
var dom_1 = require("../utils/dom");
var gravityDocument_1 = __importDefault(require("../utils/gravityDocument"));
var viewport_1 = __importDefault(require("../utils/viewport"));
var location_1 = __importDefault(require("../utils/location"));
var createTargetDisplayInfo_1 = require("./createTargetDisplayInfo");
var getDocument_1 = __importDefault(require("../utils/getDocument"));
var createSelectors_1 = require("../utils/createSelectors");
var createTargetedUserActionDefaultOptions = {
    selectorsOptions: undefined,
    excludeRegex: null,
    customSelector: undefined,
    document: (0, getDocument_1.default)(),
};
function createTargetedUserAction(event, type, customOptions) {
    var options = __assign(__assign({}, createTargetedUserActionDefaultOptions), customOptions);
    var target = event.target;
    if (target === null || target === undefined || event.target === options.document)
        return null;
    var userAction = {
        type: type,
        target: createActionTarget(target, options),
        location: (0, location_1.default)(),
        document: (0, gravityDocument_1.default)(),
        recordedAt: new Date().toISOString(),
        viewportData: (0, viewport_1.default)(),
    };
    var userActionData = createActionData(event, type);
    if (userActionData !== null) {
        userAction.userActionData = userActionData;
    }
    return userAction;
}
exports.createTargetedUserAction = createTargetedUserAction;
function createActionData(event, type) {
    switch (type) {
        case types_1.UserActionType.Click:
            return createClickUserActionData(event);
        case types_1.UserActionType.KeyDown:
        case types_1.UserActionType.KeyUp:
            return createKeyUserActionData(event);
        default:
            return null;
    }
}
function createClickUserActionData(event) {
    var actionData = {
        clickOffsetX: Math.trunc(event.clientX),
        clickOffsetY: Math.trunc(event.clientY),
    };
    var target = event.target;
    if (target !== null) {
        var targetOffset = target.getBoundingClientRect();
        actionData.elementOffsetX = Math.trunc(targetOffset.left);
        actionData.elementOffsetY = Math.trunc(targetOffset.top);
        actionData.elementRelOffsetX = Math.trunc(event.clientX - targetOffset.left);
        actionData.elementRelOffsetY = Math.trunc(event.clientY - targetOffset.top);
    }
    return actionData;
}
function createKeyUserActionData(event) {
    var key = event.key, code = event.code;
    return {
        key: key,
        code: code,
    };
}
function createActionTarget(target, options) {
    var customSelector = options.customSelector, document = options.document, selectorsOptions = options.selectorsOptions;
    var actionTarget = {
        element: target.tagName.toLocaleLowerCase(),
    };
    var type = target.getAttribute('type');
    if (type !== null)
        actionTarget.type = type;
    if ((0, dom_1.isCheckableElement)(target)) {
        actionTarget.value = target.checked.toString();
    }
    actionTarget.selectors = (0, createSelectors_1.createSelectors)(target, selectorsOptions);
    var customSelectorAttribute = customSelector !== undefined ? target.getAttribute(customSelector) : null;
    if (customSelectorAttribute !== null) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        actionTarget.selector = "[".concat(customSelector, "=").concat(customSelectorAttribute, "]");
    }
    else {
        try {
            actionTarget.selector = (0, unique_selector_1.default)(target, { excludeRegex: options.excludeRegex });
        }
        catch (_a) {
            // ignore
        }
    }
    var displayInfo = (0, createTargetDisplayInfo_1.createTargetDisplayInfo)(target, document);
    if (displayInfo !== undefined)
        actionTarget.displayInfo = displayInfo;
    return actionTarget;
}
