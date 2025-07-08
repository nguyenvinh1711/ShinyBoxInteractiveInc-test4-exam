// * This file is all middlewares for items
import { APIError } from '../utils/customErrors.js';
import { fetchDataAsync } from '../utils/fileProcessor.js';

// * Check id & name are both unique (assume product's name is unique)
const validateExistingItem = async (req, res, next) => {
    try {
        // * Validated item from previous middleware
        const item = req.body;
        const data = await fetchDataAsync(global.DATA_PATH);

        // * Make sure id and name are unique
        if (data.find(i => i.id === item.id
            || i.name.toLowerCase().includes(item.name.toLowerCase().trim()))) {
            throw new APIError('Item already exists', 409);
        }

        // * Add data to req to send next middleware (optimization)
        req.data = data;
        next();
    }
    catch (err) {
        next(err);
    }
}

// other middleware functions 

export { validateExistingItem };