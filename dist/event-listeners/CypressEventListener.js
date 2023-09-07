"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
var location_1 = __importDefault(require("../utils/location"));
var gravityDocument_1 = __importDefault(require("../utils/gravityDocument"));
var CypressEventListener = /** @class */ (function () {
    function CypressEventListener(cypress, userActionHandler) {
        var _this = this;
        this.cypress = cypress;
        this.userActionHandler = userActionHandler;
        this.listeners = new Map();
        this.testAfterRunListener = function () {
            console.log('[test:after:run] userActionHandler.flush()');
            _this.userActionHandler.flush();
        };
        var _loop_1 = function (cypressEvent) {
            this_1.listeners.set(cypressEvent, function (event) {
                _this.userActionHandler.handle({
                    type: types_1.UserActionType.TestCommand,
                    command: extractCypressCommand(cypressEvent, event),
                    document: (0, gravityDocument_1.default)(),
                    location: (0, location_1.default)(),
                    recordedAt: new Date().toISOString(),
                    viewportData: {},
                });
            });
        };
        var this_1 = this;
        for (var _i = 0, _a = Object.values(types_1.CypressEvent); _i < _a.length; _i++) {
            var cypressEvent = _a[_i];
            _loop_1(cypressEvent);
        }
    }
    CypressEventListener.prototype.init = function () {
        for (var _i = 0, _a = Array.from(this.listeners.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], cypressEvent = _b[0], listener = _b[1];
            if (!this.cypress.listeners(cypressEvent).includes(listener))
                this.cypress.addListener(cypressEvent, listener);
        }
        this.cypress.addListener('test:after:run', this.testAfterRunListener);
    };
    CypressEventListener.prototype.terminate = function () {
        this.cypress.removeListener('test:after:run', this.testAfterRunListener);
        for (var _i = 0, _a = Array.from(this.listeners.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], cypressEvent = _b[0], listener = _b[1];
            this.cypress.removeListener(cypressEvent, listener);
        }
    };
    return CypressEventListener;
}());
exports.default = CypressEventListener;
function extractCypressCommand(eventType, event) {
    var _a, _b;
    var _c = event.attributes, name = _c.name, args = _c.args, id = _c.id, chainerId = _c.chainerId, prev = _c.prev, next = _c.next, type = _c.type, userInvocationStack = _c.userInvocationStack;
    return {
        name: name,
        args: lightenArguments(args),
        id: id,
        chainerId: chainerId,
        event: eventType,
        type: type,
        prevId: (_a = prev === null || prev === void 0 ? void 0 : prev.attributes) === null || _a === void 0 ? void 0 : _a.id,
        nextId: (_b = next === null || next === void 0 ? void 0 : next.attributes) === null || _b === void 0 ? void 0 : _b.id,
        userInvocationStack: userInvocationStack,
    };
}
function lightenArguments(args) {
    var length = JSON.stringify(args !== null && args !== void 0 ? args : '').length;
    if (length > 255)
        return ["Gravity Collector replaced these too long args (".concat(length, " chars)")];
    return args;
}
