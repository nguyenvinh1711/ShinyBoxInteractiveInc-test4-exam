import React, { useRef, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import Spinner from "./Spinner";
import { Kbd } from "react-daisyui";

export default function PaginationWindow({
    // Are there more items to load?
    // (This information comes from the most recent API request.)
    hasNextPage,

    // Are we currently loading a page of items?
    // (This may be an in-flight flag in your Redux store for example.)
    isNextPageLoading,

    // Array of items loaded so far.
    items,

    // Callback function responsible for loading the next page of items.
    loadNextPage,

    renderItem,

    resetCache
}) {
    // console.log("PaginationWindow rendered!!");
    // We create a reference for the InfiniteLoader 
    const infiniteLoaderRef = useRef(null);
    const hasMountedRef = useRef(false);


    // Each time the resetCache prop changed we called the method resetloadMoreItemsCache to clear the cache
    useEffect(() => {
        // console.log("resetCache changed!!");
        // We only need to reset cached items when "resetCache" changes.
        // This effect will run on mount too; there's no need to reset in that case.
        if (hasMountedRef.current) {
            if (infiniteLoaderRef.current) {
                infiniteLoaderRef.current.resetloadMoreItemsCache();
            }
        }

        hasMountedRef.current = true;

    }, [resetCache]);

    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    const itemCount = hasNextPage ? items.length + 1 : items.length;

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = isNextPageLoading ? () => { } : loadNextPage;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = index => !hasNextPage || index < items.length;

    // Render an item or a loading indicator.
    const Item = ({ index, style }) => {
        let content;
        if (!isItemLoaded(index)) {
            content = <Spinner />;
        } else {
            content = renderItem(index, items[index]);
        }

        return <div style={style}>{content}</div>;
    };


    return (
        <InfiniteLoader
            ref={infiniteLoaderRef}
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
        >
            {({ onItemsRendered, ref }) => (
                <List
                    className="bg-gray-800 rounded-lg h-full!"
                    width={"100%"}
                    height={200}
                    itemCount={itemCount}
                    itemSize={30}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                >
                    {Item}
                </List>
            )}
        </InfiniteLoader>
    );
}
