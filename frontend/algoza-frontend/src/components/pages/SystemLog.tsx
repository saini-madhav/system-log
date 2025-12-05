import { useEffect, useState } from "react";
import type { ISystemLog } from "../../interface/systemInterface";
import { getSystemLogApi } from "../../services/systemServices";

const SystemLog = () => {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    const DefaultEndDate = today.toISOString().split('T')[0];
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const DefaultStartDate = threeMonthsAgo.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState<string>(DefaultStartDate);
    const [endDate, setEndDate] = useState<string>(DefaultEndDate );
    const [systemLog, setSystemLog] = useState<ISystemLog[]>([]);
    
    // console.log("startDate---", startDate);
    // console.log("endDate---", endDate);
    const fetchSystemLog = async () => {
        try {
            const response = await getSystemLogApi(startDate, endDate);
            console.log("Response from API:", response);
            // const data = await response.json();
            setSystemLog(response?.data || []);
            console.log("System Log Data:", response);
        } catch (error) {
            console.error("Error fetching system log:", error);
        }
    };

    useEffect(() => {
        fetchSystemLog();
    }, [startDate, endDate]);

    const changeStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("e.target.value", e.target.value);
        setStartDate(e.target.value);
    };

    const changeEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };

    return (
        <>
            <div>
                <h1>System Log</h1>
                <div>
                    <label>Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => changeStartDate(e)}
                    />
                </div>
                <div>
                    <label>End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => changeEndDate(e)}
                    />
                </div>
                
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Computer Name</th>
                        <th>Number of Disconnected Per Computer</th>
                        {/* <th>Timestamp</th> */}
                    </tr>
                </thead>
                <tbody>
                    {systemLog && systemLog.length ? (
                        systemLog.map((log, index) => (
                            <tr key={index}>
                                <td>{log.computerName}</td>
                                <td>{log.numberOfDisconnectedPerCopmuter}</td>
                                {/* <td>{log.timestamp}</td> */}
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={3}>No data available</td></tr>
                    )}
                </tbody>
            </table>
        </>
    );
};

export default SystemLog;
