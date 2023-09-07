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
exports.sendSessionTraits = exports.debugSessionTraitSender = exports.defaultSessionTraitSender = exports.IdentifySessionError = void 0;
var cross_fetch_1 = __importDefault(require("cross-fetch"));
var nop_1 = require("../utils/nop");
var gravityEndPoints_1 = require("../gravityEndPoints");
var IdentifySessionError;
(function (IdentifySessionError) {
    IdentifySessionError["accessDenied"] = "no_access";
    IdentifySessionError["collectionNotFound"] = "collection_not_found";
    IdentifySessionError["sessionNotFound"] = "session_not_found";
    IdentifySessionError["domainNotFound"] = "domain_not_found";
    IdentifySessionError["domainExpired"] = "domain_expired";
    IdentifySessionError["invalidField"] = "invalid_field";
    IdentifySessionError["incorrectSource"] = "incorrect_source";
    IdentifySessionError["notUUID"] = "not_a_uuid";
})(IdentifySessionError = exports.IdentifySessionError || (exports.IdentifySessionError = {}));
function defaultSessionTraitSender(authKey, gravityServerUrl, successCallback, errorCallback) {
    var _this = this;
    if (successCallback === void 0) { successCallback = nop_1.nop; }
    if (errorCallback === void 0) { errorCallback = nop_1.nop; }
    return function (sessionId, traits) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sendSessionTraits(authKey, gravityServerUrl, sessionId, traits, null, successCallback, errorCallback)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
}
exports.defaultSessionTraitSender = defaultSessionTraitSender;
function debugSessionTraitSender(maxDelay, output) {
    if (output === void 0) { output = console.log; }
    return function (_sessionId, traits) {
        if (maxDelay === 0) {
            printTraits(traits, output);
        }
        setTimeout(function () {
            printTraits(traits, output);
        }, Math.random() * maxDelay);
    };
}
exports.debugSessionTraitSender = debugSessionTraitSender;
function printTraits(traits, output) {
    output('[Gravity Logger (debug mode)]');
    output("identify session with ".concat(JSON.stringify(traits)));
}
function sendSessionTraits(authKey, gravityServerUrl, sessionId, sessionTraits, source, successCallback, errorCallback, fetch) {
    if (source === void 0) { source = null; }
    if (successCallback === void 0) { successCallback = nop_1.nop; }
    if (errorCallback === void 0) { errorCallback = nop_1.nop; }
    if (fetch === void 0) { fetch = cross_fetch_1.default; }
    return __awaiter(this, void 0, void 0, function () {
        var headers, response, identifySessionResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    headers = {
                        'Content-Type': 'application/json',
                    };
                    if (source !== null) {
                        headers.Origin = source;
                    }
                    return [4 /*yield*/, fetch((0, gravityEndPoints_1.buildGravityTrackingIdentifySessionApiUrl)(authKey, gravityServerUrl, sessionId), {
                            method: 'POST',
                            body: JSON.stringify(sessionTraits),
                            redirect: 'follow',
                            headers: headers,
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    identifySessionResponse = _a.sent();
                    if (response.status === 200) {
                        successCallback();
                    }
                    else {
                        identifySessionResponse.error !== null && errorCallback(response.status, identifySessionResponse.error);
                    }
                    return [2 /*return*/, identifySessionResponse];
            }
        });
    });
}
exports.sendSessionTraits = sendSessionTraits;
