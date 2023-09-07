"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var createSessionStartedUserAction_1 = require("../user-action/createSessionStartedUserAction");
var UserActionHandler_1 = __importDefault(require("../user-action/UserActionHandler"));
var sessionUserActionSender_1 = require("../user-action/sessionUserActionSender");
var MemoryUserActionsHistory_1 = __importDefault(require("../user-actions-history/MemoryUserActionsHistory"));
var SessionTraitHandler_1 = __importDefault(require("../session-trait/SessionTraitHandler"));
var sessionTraitSender_1 = require("../session-trait/sessionTraitSender");
var nop_1 = require("../utils/nop");
var EventListenersHandler_1 = __importDefault(require("../event-listeners-handler/EventListenersHandler"));
var ClickEventListener_1 = __importDefault(require("../event-listeners/ClickEventListener"));
var BeforeUnloadEventListener_1 = __importDefault(require("../event-listeners/BeforeUnloadEventListener"));
var ChangeEventListener_1 = __importDefault(require("../event-listeners/ChangeEventListener"));
var KeyDownEventListener_1 = __importDefault(require("../event-listeners/KeyDownEventListener"));
var KeyUpEventListener_1 = __importDefault(require("../event-listeners/KeyUpEventListener"));
var config_1 = require("../config");
var TrackingHandler_1 = __importDefault(require("../tracking-handler/TrackingHandler"));
var checkSessionTraitValue_1 = require("../session-trait/checkSessionTraitValue");
var createAsyncRequest_1 = __importDefault(require("../user-action/createAsyncRequest"));
var gravityEndPoints_1 = require("../gravityEndPoints");
var CypressEventListener_1 = __importDefault(require("../event-listeners/CypressEventListener"));
var CollectorWrapper = /** @class */ (function () {
    function CollectorWrapper(options, window, sessionIdHandler, testNameHandler) {
        var _this = this;
        var _a;
        this.options = options;
        this.window = window;
        this.sessionIdHandler = sessionIdHandler;
        this.testNameHandler = testNameHandler;
        this.trackingHandler = new TrackingHandler_1.default(config_1.config.ERRORS_TERMINATE_TRACKING);
        var userActionOutput = options.debug
            ? (0, sessionUserActionSender_1.debugSessionUserActionSender)(options.maxDelay)
            : (0, sessionUserActionSender_1.defaultSessionUserActionSender)(options.authKey, options.gravityServerUrl, nop_1.nop, this.trackingHandler.getSenderErrorCallback());
        var sessionTraitOutput = options.debug
            ? (0, sessionTraitSender_1.debugSessionTraitSender)(options.maxDelay)
            : (0, sessionTraitSender_1.defaultSessionTraitSender)(options.authKey, options.gravityServerUrl, nop_1.nop, this.trackingHandler.getSenderErrorCallback());
        var isNewSession = !sessionIdHandler.isSet() || testNameHandler.isNewTest();
        testNameHandler.refresh();
        if (isNewSession) {
            this.trackingHandler.setActive(keepSession(options));
            sessionIdHandler.generateNewSessionId();
        }
        this.userActionsHistory = new MemoryUserActionsHistory_1.default();
        this.userActionHandler = new UserActionHandler_1.default(sessionIdHandler, options.requestInterval, userActionOutput, options.onPublish, this.userActionsHistory);
        this.sessionTraitHandler = new SessionTraitHandler_1.default(sessionIdHandler, options.requestInterval, sessionTraitOutput);
        if (isNewSession)
            this.initSession((0, createSessionStartedUserAction_1.createSessionStartedUserAction)());
        var targetedEventListenerOptions = {
            excludeRegex: options.excludeRegex,
            customSelector: options.customSelector,
            selectorsOptions: options.selectorsOptions,
        };
        var eventListeners = [
            new ClickEventListener_1.default(this.userActionHandler, this.window, targetedEventListenerOptions),
            new KeyUpEventListener_1.default(this.userActionHandler, this.window, targetedEventListenerOptions),
            new KeyDownEventListener_1.default(this.userActionHandler, this.window, this.userActionsHistory, targetedEventListenerOptions),
            new ChangeEventListener_1.default(this.userActionHandler, this.window, targetedEventListenerOptions),
            new BeforeUnloadEventListener_1.default(this.userActionHandler, this.window),
        ];
        var cypress = (_a = window.Cypress) !== null && _a !== void 0 ? _a : undefined;
        if (cypress !== undefined) {
            eventListeners.push(new CypressEventListener_1.default(cypress, this.userActionHandler));
        }
        this.eventListenerHandler = new EventListenersHandler_1.default(eventListeners);
        this.trackingHandler.init(this.eventListenerHandler);
        var originalFetch = window.fetch;
        window.fetch = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var resource, config, url, method;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            resource = args[0], config = args[1];
                            url = resource;
                            if (this.trackingHandler.isTracking() &&
                                requestCanBeRecorded(url, options.gravityServerUrl, (_a = options.recordRequestsFor) !== null && _a !== void 0 ? _a : options.originsToRecord)) {
                                method = 'unknown';
                                if ((config === null || config === void 0 ? void 0 : config.method) != null) {
                                    method = config.method;
                                }
                                this.userActionHandler.handle((0, createAsyncRequest_1.default)(url, method));
                            }
                            return [4 /*yield*/, originalFetch(resource, config)];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        };
        var collectorWrapper = this;
        var originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function () {
            var _a;
            var method = arguments[0];
            var url = arguments[1];
            if (collectorWrapper.trackingHandler.isTracking() &&
                requestCanBeRecorded(url, options.gravityServerUrl, (_a = options.recordRequestsFor) !== null && _a !== void 0 ? _a : options.originsToRecord)) {
                collectorWrapper.userActionHandler.handle((0, createAsyncRequest_1.default)(url, method));
            }
            return originalXHROpen.apply(this, Array.prototype.slice.call(arguments));
        };
    }
    CollectorWrapper.prototype.identifySession = function (traitName, traitValue) {
        if (this.trackingHandler.isTracking() && (0, checkSessionTraitValue_1.preventBadSessionTraitValue)(traitValue)) {
            this.sessionTraitHandler.handle(traitName, traitValue);
        }
    };
    CollectorWrapper.prototype.initSession = function (sessionStartedUserAction) {
        if (this.trackingHandler.isTracking())
            this.userActionHandler.handle(sessionStartedUserAction);
    };
    return CollectorWrapper;
}());
exports.default = CollectorWrapper;
function keepSession(options) {
    var keepSession = options.sessionsPercentageKept >= 100 * Math.random();
    var rejectSession = options.rejectSession();
    return keepSession && !rejectSession;
}
function requestCanBeRecorded(url, gravityServerUrl, recordRequestsFor) {
    if (recordRequestsFor === undefined) {
        return false;
    }
    if (url.startsWith((0, gravityEndPoints_1.trackingUrlStartPart)(gravityServerUrl))) {
        return false;
    }
    for (var _i = 0, recordRequestsFor_1 = recordRequestsFor; _i < recordRequestsFor_1.length; _i++) {
        var urlOrigin = recordRequestsFor_1[_i];
        if (url.startsWith(urlOrigin)) {
            return true;
        }
    }
    return false;
}
