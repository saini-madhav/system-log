
import axios from 'axios';
 
const apiBaseUrl = 'http://localhost:3002/api/v1';
const getSystemLogApi = async (startDate: string, endDate: string) => {
    try {
        const response = await axios.get(`${apiBaseUrl}/system/log?startDate=${startDate}&endDate=${endDate}`);
        // Axios throws for non-2xx responses by default, but we keep a safeguard check.
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`Error fetching system log: ${response.statusText || response.status}`);
        }
        const data = response.data;
        return data;
    } catch (error) {
        console.error("Error in getSystemLog service:", error);
        throw error;
    }
};

export { getSystemLogApi };