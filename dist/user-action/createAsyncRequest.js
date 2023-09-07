"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
var location_1 = __importDefault(require("../utils/location"));
var gravityDocument_1 = __importDefault(require("../utils/gravityDocument"));
var viewport_1 = __importDefault(require("../utils/viewport"));
function createAsyncRequest(url, method) {
    return {
        url: url,
        method: method,
        type: types_1.UserActionType.AsyncRequest,
        location: (0, location_1.default)(),
        document: (0, gravityDocument_1.default)(),
        recordedAt: new Date().toISOString(),
        viewportData: (0, viewport_1.default)(),
    };
}
exports.default = createAsyncRequest;
