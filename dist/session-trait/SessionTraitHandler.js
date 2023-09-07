"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SessionTraitHandler = /** @class */ (function () {
    function SessionTraitHandler(sessionIdHandler, requestInterval, output) {
        var _this = this;
        this.sessionIdHandler = sessionIdHandler;
        this.requestInterval = requestInterval;
        this.output = output;
        this.buffer = {};
        if (requestInterval > 0) {
            this.timer = setInterval(function () {
                void _this.flush();
            }, requestInterval);
        }
    }
    SessionTraitHandler.prototype.handle = function (traitName, traitValue) {
        this.buffer[traitName] = traitValue;
        if (this.timer == null) {
            this.flush();
        }
    };
    SessionTraitHandler.prototype.flush = function () {
        if (Object.keys(this.buffer).length === 0) {
            return;
        }
        this.output(this.sessionIdHandler.get(), this.buffer);
        this.buffer = {};
    };
    return SessionTraitHandler;
}());
exports.default = SessionTraitHandler;
