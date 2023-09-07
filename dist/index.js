"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("regenerator-runtime/runtime");
var GravityCollector_1 = __importDefault(require("./collector/GravityCollector"));
var windowExists_1 = __importDefault(require("./utils/windowExists"));
if ((0, windowExists_1.default)()) {
    ;
    window.GravityCollector = GravityCollector_1.default;
}
exports.default = GravityCollector_1.default;
