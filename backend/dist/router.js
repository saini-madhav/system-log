"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const systemRoutes_1 = __importDefault(require("./routes/systemRoutes"));
const Routes = (0, express_1.Router)();
Routes.use("/system", systemRoutes_1.default);
exports.default = Routes;
