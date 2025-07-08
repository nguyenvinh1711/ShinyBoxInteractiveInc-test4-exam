const API_URL = process.env.REACT_APP_API_URL;
export const fetchStatsURL = `${API_URL}/api/stats`;


export const fetchStats = async () => {
    const response = await fetch(`${fetchStatsURL}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.statusText}`);
    }
    return response.json();
}
