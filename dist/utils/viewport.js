"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var windowExists_1 = __importDefault(require("./windowExists"));
function viewport() {
    if (!(0, windowExists_1.default)()) {
        return {};
    }
    var viewportWidth = window.innerWidth, viewportHeight = window.innerHeight, windowWidth = window.outerWidth, windowHeight = window.outerHeight;
    var _a = window.screen, colorDepth = _a.colorDepth, pixelDepth = _a.pixelDepth, orientation = _a.orientation, screenWidth = _a.width, screenHeight = _a.height, availScreenWidth = _a.availWidth, availScreenHeight = _a.availHeight;
    return {
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        windowWidth: windowWidth,
        windowHeight: windowHeight,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        availScreenWidth: availScreenWidth,
        availScreenHeight: availScreenHeight,
        colorDepth: colorDepth,
        pixelDepth: pixelDepth,
        orientation: orientation === null || orientation === void 0 ? void 0 : orientation.type,
    };
}
exports.default = viewport;
