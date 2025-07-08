import itemsRouter from './items.js';
import statsRouter from './stats.js';
import { notFound, errorGlobalHandler } from '../middleware/errorHandler.js';
import logger from '../middleware/logger.js';

export default function registerRoutes(app) {
    app.use(logger)
        .use('/api/items', itemsRouter)
        .use('/api/stats', statsRouter)
        .use('*', notFound)
        .use(errorGlobalHandler);
}