import { APIError } from '../utils/customErrors.js';

// * This file is request data validation middleware
const validateRequest = (schema, field) => {
    // check schema is a valid Zod schema
    if (!schema || typeof schema !== 'object' || !Object.hasOwn(schema, 'parse')) {
        throw new Error('Invalid schema');
    }

    return (req, res, next) => {
        try {
            // * Check if field is a valid field
            if (!Object.hasOwn(req, field)) {
                throw new APIError('Invalid field', 400);
            }

            // console.log("req[field]", req[field]);
            // * Update values for req[field] after validation
            req[field] = schema.parse(req[field] || {});

            next();
        } catch (err) {
            next(err);
        }
    }
};


export { validateRequest };