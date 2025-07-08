// * This is main request handler for items
import { calculateStats } from '../utils/stats.js';
import FileProcessor from '../utils/fileProcessorClass.js';
import { fetchDataAsync } from '../utils/fileProcessor.js';
import { meanByKey } from '../utils/stats.js';

class StatsController {
    async getStats(req, res, next) {
        try {
            // const fileProcessor = new FileProcessor(global.DATA_PATH);
            // console.log("fileProcessor", fileProcessor);
            // const data = await fileProcessor.fetchDataAsync();
            const data = await fetchDataAsync(global.DATA_PATH);

            // * hidden query used for testing cached stats
            let cache = true;
            if (process.env.NODE_ENV === 'test' && !req.query.cache) {
                cache = false;
            }

            // Intentional heavy CPU calculation
            let stats = {}
            if (cache) {
                stats = calculateStats(data);
            }
            else {
                stats = {
                    total: data.length,
                    averagePrice: meanByKey(data, 'price')
                };
            }

            res.json(stats);
        } catch (err) {
            next(err);
        }
    }

    // Add other handlers afterwards
}

export default new StatsController();   