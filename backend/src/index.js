import app from './app.js';
import constants from './configs/constants.js';
import { watchFile } from './utils/fileProcessor.js';
import logger from './utils/logger.js';

// * Added global.DATA_PATH to make it accessible to all files
global.DATA_PATH = constants.DATA_PATH;

// * Call watchFile to watch the data file for changes to re-calculate the stats
watchFile(global.DATA_PATH);

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, (error) => {
    if (error) {
        logger.error(error, 'Server failed to start');
        process.exit(1);
    } else {
        logger.info(`Server is running on port ${PORT}`);
    }
});

export default server;