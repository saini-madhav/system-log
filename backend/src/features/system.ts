import { Request, Response } from "express";
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

export const getSystemLog = async (req: Request, res: Response) => {
    console.log("Fetching system log...");
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    try {
        // Try multiple paths for logs directory to support both local and Vercel deployments
        let logsDir = path.join(__dirname, "../../logs");
        
        // If running from dist, try the original source relative path
        if (!fs.existsSync(logsDir)) {
            logsDir = path.join(process.cwd(), "logs");
        }
        
        // If still not found, try absolute path from project root
        if (!fs.existsSync(logsDir)) {
            logsDir = path.join(__dirname, "../../../logs");
        }
        
        console.log("Logs directory path:", logsDir);
        console.log("Logs directory exists:", fs.existsSync(logsDir));
        
        if (!fs.existsSync(logsDir)) {
            return res.status(404).json({ 
                status: "error", 
                message: "Logs directory not found",
                searchedPaths: [
                    path.join(__dirname, "../../logs"),
                    path.join(process.cwd(), "logs"),
                    path.join(__dirname, "../../../logs")
                ]
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

            // Read file content up-front so we can extract the date from inside the log
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");

            // Try to find a date inside the file in the form "(MM/DD" (e.g. "(11/23 10:54:09")
            const dateMatch = content.match(/\((\d{1,2})\/(\d{1,2})\b/);
            // Use the file's mtime to determine the year (fallback if year is not present in the log)
            const stats = fs.statSync(filePath);
            const fileYear = stats.mtime.getFullYear();

            const pad = (s: string | number) => String(s).padStart(2, "0");

            let fileDateStr: string;
            if (dateMatch) {
                const month = pad(dateMatch[1]);
                const day = pad(dateMatch[2]);
                fileDateStr = `${fileYear}-${month}-${day}`;
            } else {
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
    } catch (error) {
        console.error("Error fetching system log:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch system log" });
    }
  
}


