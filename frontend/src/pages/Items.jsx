import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
// import { useData } from '../state/DataContext';
// import { FixedSizeList as List } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';

import PaginationWindow from '../components/PaginationWindow';
import { Skeleton, Input, Button, Kbd, Table, Loading } from 'react-daisyui';
import ErrorAlert from '../components/ErrorAlert';
// import Spinner from '../components/Spinner';

// import { useErrorBoundary } from 'react-error-boundary';
// import usePrevious from '../hooks/usePrevious';
import useAbortableFetch from '../hooks/useAbortableFetch';

import { fetchItems } from '../apis/items';
import { fetchStatsURL } from '../apis/stats';

import { throttle } from 'lodash';


// const API_URL = process.env.REACT_APP_API_URL;

function Items() {
    // console.log("Items rendered!!");

    /**
    // * Fix memory leak: Method 1: use useData provider with isMounted flag
    // const { showBoundary } = useErrorBoundary()
    const { items, updateItems, fetchItems } = useData();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        // * fetch data and only update state if component is still mounted
        fetchItems()
            .then((data) => {
                // Only update state if component is still mounted
                if (isMounted) {
                    updateItems(data);
                } else {
                    console.log('Component unmounted, skipping state update');
                }
            })
            .catch((error) => {
                // Only log error if component is still mounted
                if (isMounted) {
                    console.error('Error fetching items:', error);
                    throw error;
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        // Clean‑up to avoid memory leak (candidate should  implement)
        return () => {
            isMounted = false;
            console.log("Component unmounted, skipping state update", isMounted);
        };
    }, [fetchItems]);
    */

    /**
    // * Fix memory leak: Method 2: custom hook useAbortableFetch to fetch data
     
    const { data, isLoading, error } = useAbortableFetch(`${API_URL}/api/items?limit=50`);
    const items = data?.pageResults || [];

    // * Apply useCallback to optimize re-rendering only when the items array changes
    const Row = useCallback(({ index, style }) => (
        <div style={style} className="hover:bg-yellow-300">
            <Link to={'/items/' + items[index]?.id}>{items[index]?.name}</Link>
        </div>
    ), [items]);

    if (isLoading) return <Skeleton className="w-[300px] h-[300px]" />;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="w-[300px] h-[300px] bg-gray-800 p-5 rounded-2xl mt-10" >
            <p className="text-white">
                useAbortableFetch to fetch data
            </p>

            <AutoSizer>
                {({ width, height }) => (
                    <List
                        width={width}
                        height={height}
                        itemCount={items.length}
                        itemSize={20}
                    >
                        {Row}
                    </List>
                )}
            </AutoSizer>
        </div >
    ); */


    // * In case large datasets: Implement pagination with react-window-infinite-loader
    const [paginatedData, setPaginatedData] = useState({
        items: [],
        hasNextPage: true,
        page: 0,
        error: null,
    });
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [resetCache, setResetCache] = useState(null);
    const prevSearchText = useRef(searchText);
    // console.log("Items rendered!!", paginatedData.items);

    // * Fetch statistics data
    const { data: statsData, isLoading: isStatsLoading, error: statsError } = useAbortableFetch(`${fetchStatsURL}`);

    const loadNextPage = () => {
        // console.log("loadNextPage called", searchText);
        const queryParamsObj = {
            limit: 10,
            page: paginatedData.page + 1,
            q: searchText
        };
        const queryParams = new URLSearchParams(queryParamsObj).toString();

        if (!paginatedData.hasNextPage)
            return;

        setIsNextPageLoading(true);
        const fetchData = async (queryParams) => {
            try {
                const { pageResults, page, hasNextPage } = await fetchItems(queryParams);
                // console.log("response", response);

                setPaginatedData(prevData => ({
                    ...prevData,
                    items: [...prevData.items].concat(pageResults.filter(item => item.name && !isNaN(item.price))),
                    page: page,
                    hasNextPage: hasNextPage,
                }));

            } catch (err) {
                setPaginatedData(prevData => ({
                    ...prevData,
                    error: err.message ? err.message : err,
                }));

            } finally {
                setIsNextPageLoading(false);
            }
        }

        fetchData(queryParams);
    }

    // * Re-load data when search button is clicked 
    useEffect(() => {
        // console.log("loadNextPage called")
        loadNextPage();
    }, [resetCache]);

    const handleSearch = (prevSearchText, searchText) => {
        // * Ignore if the searchText doesn't change
        if (prevSearchText && searchText === prevSearchText.current) {
            return;
        }

        // * Reset pagination data to fetch new items
        setPaginatedData(prevData => ({
            ...prevData,
            items: [],
            hasNextPage: true,
            page: 0,
            error: null,
        }));

        // * Trigger remove cached items in pagination window
        setResetCache(searchText);
        // * Update the previous search text
        prevSearchText.current = searchText;
    }


    // * Throttle the handleSearch function to prevent multiple calls
    const throttledHandleSearch = useCallback(
        // * This execute immediately on the first click, then ignore clicks for 1000ms
        throttle(handleSearch, 1000, { leading: true, trailing: false }),
        []
    );

    useEffect(() => {
        return () => {
            throttledHandleSearch.cancel();
        };
    }, [throttledHandleSearch]);

    return (
        <div className="flex flex-col items-center justify-start h-full" >

            <p className="text-blue-600 my-5">
                This demo app shows products list that automatically loads the
                next "page" of products when a user scrolls down the list.
            </p>

            {/* // * Search Section */}
            <div className="flex items-center justify-between w-full">
                <Input
                    type="text"
                    placeholder="Search by name"
                    value={searchText}
                    className="w-3/4"
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Button onClick={() => throttledHandleSearch(prevSearchText, searchText)} disabled={isNextPageLoading} data-testid="search-button">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <title>Search icon</title>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </Button>
            </div>

            {/* // * Statistics Section */}
            {isStatsLoading ? <Skeleton className="w-[100px] h-[30px]" data-testid="stats-skeleton" /> :
                statsError ? <ErrorAlert error="Failed to fetch statistics data" /> :
                    <div className="flex items-center justify-between my-3 w-full font-semibold">
                        <div className="text-green-400">Total products
                            <div data-testid="total-products">{statsData?.total || 0}</div>
                        </div>
                        <div className="text-blue-400" >Average price
                            <div data-testid="average-price">${parseFloat(statsData?.averagePrice).toFixed(2)}</div>
                        </div>
                    </div>
            }

            {/* // * Items Section */}
            {
                paginatedData.error ? <ErrorAlert error="Failed to fetch products data" /> :
                    // ! Should NOT show Skeleton when loading because it will cause the list to jump
                    // isNextPageLoading ? <Skeleton className="w-full h-[200px]" /> :
                    paginatedData.items.length === 0 ? <Kbd className="text-gray-400">No products found</Kbd> :
                        <PaginationWindow
                            {...paginatedData}
                            isNextPageLoading={isNextPageLoading}
                            loadNextPage={loadNextPage}
                            resetCache={resetCache}
                            renderItem={(index, item) => (
                                <div
                                    key={index}
                                    className="p-3"
                                >
                                    <Link to={'/items/' + item?.id} className="flex items-center justify-between hover:bg-blue-900 text-sm">
                                        <div className="text-white text-left text-ellipsis whitespace-nowrap
overflow-hidden pr-2">{item?.name}</div>
                                        <div className="text-yellow-400 text-right ">${item?.price}</div>
                                    </Link>
                                </div>
                            )}
                        />
            }
        </div>
    )


}


export default Items;