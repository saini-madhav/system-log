"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLog = void 0;
const system_1 = require("../features/system");
const getLog = async (req, res) => {
    return await (0, system_1.getSystemLog)(req, res);
};
exports.getLog = getLog;
