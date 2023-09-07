"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var CollectorWrapper_1 = __importDefault(require("./CollectorWrapper"));
var windowExists_1 = __importDefault(require("../utils/windowExists"));
var completeOptions_1 = __importDefault(require("../utils/completeOptions"));
var SessionStorageTestNameHandler_1 = __importDefault(require("../test-name-handler/SessionStorageTestNameHandler"));
var uuid_1 = require("uuid");
var CookieSessionIdHandler_1 = __importDefault(require("../session-id-handler/CookieSessionIdHandler"));
var TIMEOUT = 1000 * 60 * 30;
var GravityCollector = /** @class */ (function () {
    function GravityCollector(collectorWrapper) {
        this.collectorWrapper = collectorWrapper;
    }
    Object.defineProperty(GravityCollector, "instance", {
        get: function () {
            return window._GravityCollector;
        },
        enumerable: false,
        configurable: true
    });
    GravityCollector.init = function (options) {
        var _a;
        if ((options === null || options === void 0 ? void 0 : options.windowInstance) === undefined && !(0, windowExists_1.default)()) {
            throw new Error('Gravity Data Collector needs a `window` instance in order to work');
        }
        var windowInstance = (_a = options === null || options === void 0 ? void 0 : options.windowInstance) !== null && _a !== void 0 ? _a : window;
        windowInstance._GravityCollector = new GravityCollector(new CollectorWrapper_1.default((0, completeOptions_1.default)(options), windowInstance, new CookieSessionIdHandler_1.default(uuid_1.v4, TIMEOUT), new SessionStorageTestNameHandler_1.default()));
    };
    GravityCollector.identifySession = function (traitName, traitValue) {
        var collectorWrapper = window._GravityCollector.collectorWrapper;
        if (collectorWrapper === undefined) {
            throw new Error('Gravity Data Collector was not initialized : please call window.GravityCollector.init() before');
        }
        collectorWrapper.identifySession(traitName, traitValue);
    };
    return GravityCollector;
}());
exports.default = GravityCollector;
