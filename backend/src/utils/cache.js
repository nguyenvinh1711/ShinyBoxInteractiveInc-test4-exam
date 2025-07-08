// * Added simple memory cache
export const memoryCache = new Map();

export const setCache = (key, value) => {
    memoryCache.set(key, value);
};

export const getCache = (key) => {
    return memoryCache.get(key);
};