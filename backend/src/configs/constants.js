import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env = process.env.NODE_ENV || 'development';

// constants should never change after initialization
const constants = Object.freeze({
    DATA_PATH: join(__dirname, `../../../data/${env}/items.json`),
    ITEMS_PER_PAGE: 10,
    LOG_PATH: join(__dirname, `../logs/${env}/app.log`),
    ACCESS_LOG_PATH: join(__dirname, `../logs/${env}/access.log`),
    FRONTEND_URL: 'http://localhost:3000',
});

export default constants;