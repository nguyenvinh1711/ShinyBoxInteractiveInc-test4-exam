// create error message for each error type
const getErrorStatus = (statusCode) => ({
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
}[statusCode]);

// * This is the base class for all kind of errors
class APIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// add other error classes afterwards

export { APIError, getErrorStatus };