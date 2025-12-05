import { VercelRequest, VercelResponse } from "@vercel/node";
import * as fs from "fs";
import * as path from "path";

const parseDate = (dateString: string): string | null => {
    if (!dateString) return null;
    
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("Fetching system log...");
    console.log("Process CWD:", process.cwd());
    console.log("__dirname:", __dirname);
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    try {
        // Try multiple paths for logs directory
        let logsDir = path.join(__dirname, "../../../logs");
        console.log("Trying path 1:", logsDir, "exists:", fs.existsSync(logsDir));
        
        if (!fs.existsSync(logsDir)) {
            logsDir = path.join(process.cwd(), "logs");
            console.log("Trying path 2:", logsDir, "exists:", fs.existsSync(logsDir));
        }
        
        if (!fs.existsSync(logsDir)) {
            logsDir = path.join(__dirname, "../../../../logs");
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
                        path.join(__dirname, "../../../logs"),
                        path.join(process.cwd(), "logs"),
                        path.join(__dirname, "../../../../logs")
                    ]
                }
            });
        }
        
        const logFiles = fs.readdirSync(logsDir);
        
        // Parse start and end dates to YYYY-MM-DD format
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        
        const computerDisconnects: { [key: string]: number } = {};
        let filesProcessed = 0;
        
        for (const file of logFiles) {
            console.log("Processing file:", file);
            const filePath = path.join(logsDir, file);

            // Read file content
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");

            // Try to find a date inside the file
            const dateMatch = content.match(/\((\d{1,2})\/(\d{1,2})\b/);
            const stats = fs.statSync(filePath);
            const fileYear = stats.mtime.getFullYear();

            const pad = (s: string | number) => String(s).padStart(2, "0");

            let fileDateStr: string;
            if (dateMatch) {
                const month = pad(dateMatch[1]);
                const day = pad(dateMatch[2]);
                fileDateStr = `${fileYear}-${month}-${day}`;
            } else {
                const m = pad(stats.mtime.getMonth() + 1);
                const d = pad(stats.mtime.getDate());
                fileDateStr = `${fileYear}-${m}-${d}`;
            }

            // Check if file is within date range
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
    } catch (error) {
        console.error("Error fetching system log:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch system log" });
    }
}
