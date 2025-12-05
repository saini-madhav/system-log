"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const systemController_1 = require("../controller/systemController");
const systemRouter = (0, express_1.Router)();
systemRouter.get("/log", systemController_1.getLog);
exports.default = systemRouter;
