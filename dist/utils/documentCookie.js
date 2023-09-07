"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCookie = exports.setCookie = void 0;
var psl_1 = __importDefault(require("psl"));
function setCookie(key, value) {
    var cookie = "".concat(key, "=").concat(encodeURIComponent(value), "; Path=/");
    if (document.location !== null && document.location !== undefined) {
        var parsedDomain = psl_1.default.parse(document.location.hostname);
        if (isParsedDomain(parsedDomain) && parsedDomain.domain !== null) {
            var domain = void 0;
            if (psl_1.default.isValid(parsedDomain.domain)) {
                domain = parsedDomain.domain;
            }
            else {
                domain = parsedDomain.input;
            }
            cookie += "; Domain=".concat(domain);
        }
    }
    document.cookie = cookie;
}
exports.setCookie = setCookie;
function readCookie(key) {
    var match = document.cookie.match(new RegExp("(^| )".concat(key, "=([^;]+)")));
    return match !== null ? decodeURIComponent(match[2]) : undefined;
}
exports.readCookie = readCookie;
function isParsedDomain(toBeDetermined) {
    return toBeDetermined.error === undefined;
}
