"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var windowExists_1 = __importDefault(require("./windowExists"));
function gravityDocument() {
    return { title: (0, windowExists_1.default)() ? window.document.title : '' };
}
exports.default = gravityDocument;
