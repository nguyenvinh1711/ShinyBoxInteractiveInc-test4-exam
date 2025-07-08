import pino from "pino";
import constants from "../configs/constants.js";

const transport = pino.transport({
    targets: [
        {
            target: 'pino/file',
            options: {
                destination: constants.LOG_PATH
            },
        },
        {
            target: 'pino-pretty', // logs to the standard output by default
        },
    ],
});

const logger = pino({
    level: process.env.PINO_LOG_LEVEL || 'info',
    enabled: process.env.NODE_ENV === 'test' ? false : true,
    // ! cannot use formatters to write log file
    // formatters: {
    //     level: (label) => {
    //         return { level: label.toUpperCase() };
    //     },
    // },
    timestamp: pino.stdTimeFunctions.isoTime,
}, transport);



export default logger;