import logger from "./logger.js";

const registerProcessHandlers = () => {
    // * Added process-level error-handling for uncaught exceptions and unhandled promise rejections
    process.on("uncaughtException", (err) => {
        logger.error(err, "Uncaught Exception");
        process.exit(1); // Exit with a non-zero code to indicate failure
    });

    // Handle unhandled promise rejections (async errors outside Express). Ex: console.log(<undefinedVariable>)
    process.on("unhandledRejection", (err) => {
        logger.error(err, "Unhandled Promise Rejection");
        process.exit(1);
    });
}

export default registerProcessHandlers;