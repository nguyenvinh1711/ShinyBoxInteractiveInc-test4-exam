const API_URL = process.env.REACT_APP_API_URL;
export const fetchItemsURL = `${API_URL}/api/items`;

export const fetchItems = async (queryParams) => {
    const response = await fetch(`${fetchItemsURL}?${queryParams}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.statusText}`);
    }
    return response.json();
}
