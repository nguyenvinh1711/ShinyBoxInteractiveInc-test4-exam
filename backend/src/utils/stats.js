import { memoryCache } from './cache.js';

// Utility intentionally unused by routes (candidate should refactor)
function meanByKey(arr, key) {
    if (!Array.isArray(arr) || arr.length === 0) {
        return 0;
    }

    const mean = arr.reduce((acc, cur) => acc + cur[key], 0) / arr.length;

    // round to 2 decimal places
    return mean.toFixed(2);
}

// * Calculate stats and cached in memory, key to trigger is the length of the items array
const calculateStats = (items, cacheKey = "stats") => {
    // console.log("cacheKey", cacheKey);
    if (!Array.isArray(items) || items.length === 0) {
        return {
            total: 0,
            averagePrice: 0
        };
    }

    const cachedStats = memoryCache.get(cacheKey);
    if (cachedStats) {
        // console.log('already cached stats!!!');
        return { ...cachedStats, cache: true };
    }

    const stats = {
        total: items.length,
        averagePrice: meanByKey(items, 'price')
    };
    memoryCache.set(cacheKey, stats);

    return stats;
}

export { meanByKey, calculateStats };