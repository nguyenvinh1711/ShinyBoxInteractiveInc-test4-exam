import { useState, useEffect, useCallback } from 'react';


// * Added AbortController to cancel the fetch request when the component unmounts
function useAbortableFetch(url) {
    if (!url) {
        throw new Error('URL is required');
    }

    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        // Initialize the AbortController
        const abortController = new AbortController();
        const signal = abortController.signal;

        setLoading(true);
        const fetchData = async () => {
            try {
                const response = await fetch(url, { signal });
                // console.log('Fetching data: ', response);

                if (response && !response.ok) {
                    throw new Error(`HTTP error! status: ${response.statusText}`);
                }

                const actualData = await response.json();
                setData(actualData);

            } catch (err) {
                // console.error("error", err);
                if (err.name == 'AbortError') {
                    // console.error('Fetch aborted');
                    return; // Ignore aborts
                }
                setError(err.message ? err.message : err);
            } finally {
                setLoading(false);
            }
        };

        if (url) { // Only fetch if URL is provided
            fetchData();
        }

        return () => {
            // console.log('Aborting fetch by cleanup');
            abortController.abort(); // Abort on unmount
        };
    }, [url]); // Re-fetch if URL changes

    return { data, isLoading, error };
}

export default useAbortableFetch;
export { useAbortableFetch };