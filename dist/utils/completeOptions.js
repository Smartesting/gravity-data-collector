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
exports.DEFAULT_SESSION_REJECTION = void 0;
var types_1 = require("../types");
var gravityEndPoints_1 = require("../gravityEndPoints");
var DEFAULT_SESSION_REJECTION = function () { return false; };
exports.DEFAULT_SESSION_REJECTION = DEFAULT_SESSION_REJECTION;
function completeOptions(options) {
    var _a, _b;
    var authKeyError = new Error('No AuthKey provided');
    if (options == null) {
        throw authKeyError;
    }
    var debug = (_a = options.debug === true) !== null && _a !== void 0 ? _a : false;
    var defaultOptions = {
        authKey: '',
        debug: false,
        maxDelay: 0,
        requestInterval: 5000,
        gravityServerUrl: gravityEndPoints_1.GRAVITY_SERVER_ADDRESS,
        excludeRegex: null,
        sessionsPercentageKept: 100,
        rejectSession: exports.DEFAULT_SESSION_REJECTION,
    };
    var debugDefaultOptions = __assign(__assign({}, defaultOptions), { maxDelay: 500 });
    var completedOptions = __assign(__assign({}, (debug ? debugDefaultOptions : defaultOptions)), sanitizeOptions(options));
    checkPropertyPercentage(completedOptions, 'sessionsPercentageKept');
    checkSelectorsOptions((_b = completedOptions.selectorsOptions) !== null && _b !== void 0 ? _b : {});
    if (!debug && (options.authKey === null || options.authKey === undefined)) {
        throw authKeyError;
    }
    return completedOptions;
}
exports.default = completeOptions;
function sanitizeOptions(options) {
    var sanitized = options;
    if (options.gravityServerUrl !== undefined) {
        sanitized.gravityServerUrl = options.gravityServerUrl.replace(/\/$/, '');
    }
    return sanitized;
}
function checkPropertyPercentage(options, property) {
    var percentage = options[property];
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        throw new Error("option \"".concat(property, "\": ").concat(percentage, " is not a valid percentage (should be in range 0..100)"));
    }
}
function checkSelectorsOptions(selectorsOptions) {
    var attributes = selectorsOptions.attributes, queries = selectorsOptions.queries, excludedQueries = selectorsOptions.excludedQueries;
    checkArrayOf(attributes, assertString, function (value) { return "option \"selectorsOptions.attributes\": \"".concat(value, "\" is not a valid option. Expected a list of strings"); }, function (value) { return "option \"selectorsOptions.attributes\": \"".concat(value, "\" is not a valid string"); });
    checkArrayOf(queries, assertQueryType, function (value) { return "option \"selectorsOptions.queries\": \"".concat(value, "\" is not a valid option. Expected a list of QueryType"); }, function (value) {
        return "option \"selectorsOptions.queries\": \"".concat(value, "\" is not a valid QueryType. Valid values are: ").concat(Object.values(types_1.QueryType).join(', '));
    });
    checkArrayOf(excludedQueries, assertQueryType, function (value) {
        return "option \"selectorsOptions.excludedQueries\": \"".concat(value, "\" is not a valid option. Expected a list of QueryType");
    }, function (value) {
        return "option \"selectorsOptions.excludedQueries\": \"".concat(value, "\" is not a valid QueryType. Valid values are: ").concat(Object.values(types_1.QueryType).join(', '));
    });
}
function checkArrayOf(toBeChecked, checker, makeNotArrayMessage, makeInvalidTypeMessage) {
    if (toBeChecked === undefined)
        return;
    if (!Array.isArray(toBeChecked))
        throw new Error(makeNotArrayMessage(toBeChecked));
    for (var _i = 0, toBeChecked_1 = toBeChecked; _i < toBeChecked_1.length; _i++) {
        var item = toBeChecked_1[_i];
        if (!checker(item))
            throw new Error(makeInvalidTypeMessage(item));
    }
}
function assertString(toBeDetermined) {
    return typeof toBeDetermined === 'string';
}
function assertQueryType(toBeDetermined) {
    return Object.values(types_1.QueryType).includes(toBeDetermined);
}
