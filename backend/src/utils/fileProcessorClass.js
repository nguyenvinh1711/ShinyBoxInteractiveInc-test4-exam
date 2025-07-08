// ! This file is for writing tests to mock, but it's not working too
import { readFile } from 'fs/promises';
import logger from './logger.js';


class FileProcessor {
    constructor(path) {
        this.path = path;
    }

    async fetchDataAsync() {
        // console.log('fetchDataAsync');
        try {
            const data = await readFile(this.path);
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
}

export { FileProcessor };
export default FileProcessor;