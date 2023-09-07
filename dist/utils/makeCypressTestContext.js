"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCypressTestContext = void 0;
var types_1 = require("../types");
function makeCypressTestContext() {
    var _a;
    var currentTest = (_a = window.Cypress) === null || _a === void 0 ? void 0 : _a.currentTest;
    if (currentTest === undefined) {
        return null;
    }
    var testContext = {
        title: currentTest.title,
        titlePath: currentTest.titlePath,
        testingTool: types_1.TestingTool.CYPRESS,
    };
    var suite = extractTestSuite();
    if (suite !== undefined) {
        testContext.suite = suite;
    }
    return testContext;
}
exports.makeCypressTestContext = makeCypressTestContext;
function extractTestSuite() {
    var _a, _b, _c;
    var mochaSuite = (_c = (_b = (_a = window.Cypress) === null || _a === void 0 ? void 0 : _a.mocha) === null || _b === void 0 ? void 0 : _b.getRunner()) === null || _c === void 0 ? void 0 : _c.suite;
    return mochaSuite === undefined ? undefined : buildTestSuite(mochaSuite);
}
function buildTestSuite(mochaSuite) {
    if (mochaSuite === undefined) {
        return undefined;
    }
    var testSuite = {
        title: mochaSuite.title,
        file: mochaSuite.file,
    };
    var parent = buildTestSuite(mochaSuite.parent);
    if (parent !== undefined) {
        testSuite.parent = parent;
    }
    return testSuite;
}
