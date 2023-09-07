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
exports.createSelectors = void 0;
var types_1 = require("../types");
var unique_selector_1 = __importDefault(require("unique-selector"));
var get_xpath_1 = __importDefault(require("get-xpath"));
var defaultCreateSelectorsOptions = {
    queries: [types_1.QueryType.id, types_1.QueryType.class, types_1.QueryType.tag, types_1.QueryType.nthChild],
    excludedQueries: [],
    attributes: [],
};
function createSelectors(element, options) {
    var _a = __assign(__assign({}, defaultCreateSelectorsOptions), options), queries = _a.queries, excludedQueries = _a.excludedQueries, attributes = _a.attributes;
    var selectors = {
        xpath: (0, get_xpath_1.default)(element, { ignoreId: true }),
        query: makeQuery(element, queries, excludedQueries),
        attributes: makeAttributes(element, attributes),
    };
    return selectors;
}
exports.createSelectors = createSelectors;
function makeQuery(element, queries, excludedQueries) {
    var selectors = [];
    var filteredQueries = queries.filter(function (query) { return !excludedQueries.includes(query); });
    var queryMap = filteredQueries.reduce(function (acc, query) {
        var selectorTypes = [queryTypeToSelectorType(query)];
        var selector = (0, unique_selector_1.default)(element, { selectorTypes: selectorTypes });
        if (selector !== null) {
            selectors.push(selector);
            acc[query] = selector;
        }
        return acc;
    }, {});
    var combined = (0, unique_selector_1.default)(element, { selectorTypes: filteredQueries.map(queryTypeToSelectorType) });
    if (combined !== null && !selectors.includes(combined)) {
        return __assign(__assign({}, queryMap), { combined: combined });
    }
    return queryMap;
}
function queryTypeToSelectorType(query) {
    var _a;
    var queryToSelector = (_a = {},
        _a[types_1.QueryType.id] = 'ID',
        _a[types_1.QueryType.class] = 'Class',
        _a[types_1.QueryType.tag] = 'Tag',
        _a[types_1.QueryType.nthChild] = 'NthChild',
        _a[types_1.QueryType.attributes] = 'Attributes',
        _a);
    return queryToSelector[query];
}
function makeAttributes(element, attributes) {
    return attributes.reduce(function (acc, attribute) {
        var value = element.getAttribute(attribute);
        if (value !== null) {
            acc[attribute] = value;
        }
        return acc;
    }, {});
}
