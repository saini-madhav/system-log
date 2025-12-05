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
    console.log("=== Fetching system log ===");
    console.log("CWD:", process.cwd());
    console.log("__dirname:", __dirname);
    
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    try {
        // Try multiple paths for logs directory to find where they're located
        const pathsToTry = [
            path.join(__dirname, "../../../logs"),
            path.join(process.cwd(), "logs"),
            path.join(__dirname, "../../../../logs"),
            "/var/task/logs",
            path.join(__dirname, "..", "..", "..", "..", "logs")
        ];
        
        let logsDir: string | null = null;
        for (const tryPath of pathsToTry) {
            console.log(`Trying: ${tryPath} | Exists: ${fs.existsSync(tryPath)}`);
            if (fs.existsSync(tryPath)) {
                logsDir = tryPath;
                console.log(`✅ Found logs at: ${logsDir}`);
                break;
            }
        }
        
        if (!logsDir) {
            console.error("❌ Logs directory not found at any path");
            return res.status(404).json({ 
                status: "error", 
                message: "Logs directory not found - check Vercel deployment",
                debug: {
                    cwd: process.cwd(),
                    dirname: __dirname,
                    pathsChecked: pathsToTry
                }
            });
        }
        
        console.log(`Reading logs from: ${logsDir}`);
        const logFiles = fs.readdirSync(logsDir);
        console.log(`Found ${logFiles.length} log files`);
        
        // Parse start and end dates to YYYY-MM-DD format
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        console.log(`Date range: ${start} to ${end}`);
        
        const computerDisconnects: { [key: string]: number } = {};
        let filesProcessed = 0;
        
        for (const file of logFiles) {
            const filePath = path.join(logsDir, file);

            try {
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
            } catch (fileError) {
                console.error(`Error processing file ${file}:`, fileError);
            }
        }
        
        console.log(`Files processed: ${filesProcessed}`);
        
        const systemLogList = Object.entries(computerDisconnects).map(([computerName, numberOfDisconnectedPerCopmuter]) => ({
            computerName,
            numberOfDisconnectedPerCopmuter
        }));
        
        console.log(`Returning ${systemLogList.length} computer records`);
        res.status(200).json({ status: "success", data: systemLogList });
    } catch (error) {
        console.error("❌ Error fetching system log:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch system log", error: String(error) });
    }
}
