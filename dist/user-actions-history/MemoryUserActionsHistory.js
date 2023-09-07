"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MemoryUserActionsHistory = /** @class */ (function () {
    function MemoryUserActionsHistory(historySize) {
        if (historySize === void 0) { historySize = 5; }
        this.historySize = historySize;
        this.userActionsHistory = [];
    }
    MemoryUserActionsHistory.prototype.getLast = function () {
        return this.userActionsHistory.slice(-1)[0];
    };
    MemoryUserActionsHistory.prototype.getUserActionsHistory = function () {
        return this.userActionsHistory;
    };
    MemoryUserActionsHistory.prototype.push = function (userAction) {
        if (this.userActionsHistory.length === this.historySize)
            this.userActionsHistory.splice(0, 1);
        this.userActionsHistory.push(userAction);
    };
    return MemoryUserActionsHistory;
}());
exports.default = MemoryUserActionsHistory;
