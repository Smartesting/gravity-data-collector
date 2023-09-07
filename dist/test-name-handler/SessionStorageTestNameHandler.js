"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GRAVITY_SESSION_STORAGE_KEY_TEST_NAME = 'gravity-test-name';
var SessionStorageTestNameHandler = /** @class */ (function () {
    function SessionStorageTestNameHandler() {
    }
    SessionStorageTestNameHandler.prototype.getCurrent = function () {
        var cypress = window.Cypress;
        if ((cypress === null || cypress === void 0 ? void 0 : cypress.currentTest) !== undefined) {
            return cypress.currentTest.titlePath.join(' > ');
        }
        return null;
    };
    SessionStorageTestNameHandler.prototype.getPrevious = function () {
        return window.sessionStorage.getItem(GRAVITY_SESSION_STORAGE_KEY_TEST_NAME);
    };
    SessionStorageTestNameHandler.prototype.isNewTest = function () {
        return this.getCurrent() !== null && this.getCurrent() !== this.getPrevious();
    };
    SessionStorageTestNameHandler.prototype.refresh = function () {
        var currentTest = this.getCurrent();
        if (currentTest !== null)
            window.sessionStorage.setItem(GRAVITY_SESSION_STORAGE_KEY_TEST_NAME, currentTest);
    };
    return SessionStorageTestNameHandler;
}());
exports.default = SessionStorageTestNameHandler;
