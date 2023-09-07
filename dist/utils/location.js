"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var windowExists_1 = __importDefault(require("./windowExists"));
function location() {
    if (!(0, windowExists_1.default)()) {
        return {
            href: '',
            pathname: '',
            search: '',
        };
    }
    var _a = window.location, href = _a.href, pathname = _a.pathname;
    var search = window.location.search.slice(1);
    return {
        href: href,
        pathname: pathname,
        search: search,
    };
}
exports.default = location;
