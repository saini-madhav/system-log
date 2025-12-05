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
        const logsDir = path.join(__dirname, "../../logs");
        const logFiles = fs.readdirSync(logsDir);
        
        // Parse start and end dates to YYYY-MM-DD format
        const start = parseDate(startDate);
        const end = parseDate(endDate);
        
        const computerDisconnects: { [key: string]: number } = {};
        let filesProcessed = 0;
        
        for (const file of logFiles) {
            // Extract date from filename (format: YYYYMMDD) and convert to YYYY-MM-DD
            const year = file.slice(0, 4);
            const month = file.slice(4, 6);
            const day = file.slice(6, 8);
            const fileDateStr = `${year}-${month}-${day}`;
            
            // Check if file is within date range using string comparison
            if (start && fileDateStr < start) {
                continue;
            }
            if (end && fileDateStr > end) {
                continue;
            }
            
            filesProcessed++;
            const filePath = path.join(logsDir, file);
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.split("\n");
            
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


