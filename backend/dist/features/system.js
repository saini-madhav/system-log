"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemLog = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const parseDate = (dateString) => {
    if (!dateString)
        return null;
    // Try DD-MM-YYYY format
    const ddmmyyyyMatch = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyyMatch) {
        return `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[1]}`;
    }
    // Try YYYY-MM-DD format
    const yyyymmddMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyymmddMatch) {
        return `${yyyymmddMatch[1]}-${yyyymmddMatch[2]}-${yyyymmddMatch[3]}`;
    }
    return null;
};
const getSystemLog = async (req, res) => {
    console.log("Fetching system log...");
    console.log("Process CWD:", process.cwd());
    console.log("__dirname:", __dirname);
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    try {
        // Try multiple paths for logs directory to support both local and Vercel deployments
        let logsDir = path.join(__dirname, "../../logs");
        console.log("Trying path 1:", logsDir, "exists:", fs.existsSync(logsDir));
        // If running from dist, try the original source relative path
        if (!fs.existsSync(logsDir)) {
            logsDir = path.join(process.cwd(), "logs");
            console.log("Trying path 2:", logsDir, "exists:", fs.existsSync(logsDir));
        }
        // If still not found, try absolute path from project root
        if (!fs.existsSync(logsDir)) {
            logsDir = path.join(__dirname, "../../../logs");
            console.log("Trying path 3:", logsDir, "exists:", fs.existsSync(logsDir));
        }
        console.log("Final logs directory path:", logsDir);
        console.log("Logs directory exists:", fs.existsSync(logsDir));
        if (!fs.existsSync(logsDir)) {
            return res.status(404).json({
                status: "error",
                message: "Logs directory not found",
                debug: {
                    cwd: process.cwd(),
                    dirname: __dirname,
                    searchedPaths: [
                        path.join(__dirname, "../../logs"),
                        path.join(process.cwd(), "logs"),
                        path.join(__dirname, "../../../logs")
                    ]
                }
            });
        }
        const logFiles = fs.readdirSync(logsDir);
        // Parse start and end dates to YYYY-MM-DD format
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        const computerDisconnects = {};
        let filesProcessed = 0;
        for (const file of logFiles) {
            console.log("Processing file:", file);
            const filePath = path.join(logsDir, file);
            // Read file content up-front so we can extract the date from inside the log
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");
            // Try to find a date inside the file in the form "(MM/DD" (e.g. "(11/23 10:54:09")
            const dateMatch = content.match(/\((\d{1,2})\/(\d{1,2})\b/);
            // Use the file's mtime to determine the year (fallback if year is not present in the log)
            const stats = fs.statSync(filePath);
            const fileYear = stats.mtime.getFullYear();
            const pad = (s) => String(s).padStart(2, "0");
            let fileDateStr;
            if (dateMatch) {
                const month = pad(dateMatch[1]);
                const day = pad(dateMatch[2]);
                fileDateStr = `${fileYear}-${month}-${day}`;
            }
            else {
                // If no date is found inside the file, fall back to the file modification date
                const m = pad(stats.mtime.getMonth() + 1);
                const d = pad(stats.mtime.getDate());
                fileDateStr = `${fileYear}-${m}-${d}`;
            }
            // Check if file is within date range using string comparison
            if (start && fileDateStr < start) {
                continue;
            }
            if (end && fileDateStr > end) {
                continue;
            }
            filesProcessed++;
            for (const line of lines) {
                const computerNameMatch = line.match(/ComputerName:([^\s]+)/);
                if (computerNameMatch) {
                    const computerName = computerNameMatch[1];
                    if (!computerDisconnects[computerName]) {
                        computerDisconnects[computerName] = 0;
                    }
                    computerDisconnects[computerName]++;
                }
            }
        }
        console.log(`Files processed: ${filesProcessed}`);
        const systemLogList = Object.entries(computerDisconnects).map(([computerName, numberOfDisconnectedPerCopmuter]) => ({
            computerName,
            numberOfDisconnectedPerCopmuter
        }));
        console.log("systemLog:", systemLogList);
        res.status(200).json({ status: "success", data: systemLogList });
    }
    catch (error) {
        console.error("Error fetching system log:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch system log" });
    }
};
exports.getSystemLog = getSystemLog;
