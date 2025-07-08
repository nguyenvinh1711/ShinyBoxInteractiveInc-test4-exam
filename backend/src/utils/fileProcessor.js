// * Added asynchronous way to read file for non-blocking I/O
import { readFile } from 'fs/promises';
import chokidar from 'chokidar';
import { calculateStats } from './stats.js';
import logger from './logger.js';

const fetchDataAsync = async (path) => {
    // console.log('fetchDataAsync');
    try {
        const data = await readFile(path);
        const parsedData = JSON.parse(data);

        // assure parsedData is an array
        if (Array.isArray(parsedData)) {
            return parsedData;
        } else {
            throw new Error('Data is not an array')
        }
    }
    catch (err) {
        logger.error(err, 'Error reading file');
        throw err;
    }
}

const watchFile = (path) => {
    const watcher = chokidar.watch(path, {
        persistent: true, // Keep the process running as long as files are watched
        ignoreInitial: true, // Don't trigger 'add' event on initial scan
        // awaitWriteFinish: { // Recommended for atomic writes
        //     stabilityThreshold: 2000, // Wait 2 seconds for writes to stabilize
        //     pollInterval: 100
        // }
    });

    watcher.on('change', async (path) => {
        logger.info(`${path} was changed. Reloading JSON data...`);

        try {
            const items = await fetchDataAsync(path);

            // * Re-calculate stats
            calculateStats(items);
            logger.info("stats re-calculated");

        } catch (error) {
            logger.error(error, 'Error reading or parsing JSON file');
        }
    });

    watcher.on('error', (error) => {
        logger.error(error, 'Watcher error');
    });

    logger.info(`Chokidar is watching for changes in ${path}`);

    return watcher;
}

// export default { fetchDataAsync, watchFile }; // * Use this for test mocking
export { fetchDataAsync, watchFile };