import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [items, setItems] = useState([]);

    // * Added to update the items state when the data is fetched
    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:3001/api/items?limit=10'); // Intentional bug: backend ignores limit
            const json = await res.json();
            // * Return data instead of setting state directly
            return json.pageResults;
        } catch (error) {
            console.error('Error fetching items:', error);
            throw new Error('Error fetching items');
        }
    }, []);

    // * Separate the logic of fetching data from the state update
    const updateItems = useCallback((newItems) => {
        setItems(newItems);
    }, []);

    return (
        <DataContext.Provider value={{ items, fetchItems, updateItems }}>
            {children}
        </DataContext.Provider>
    );
}

export const useData = () => useContext(DataContext);