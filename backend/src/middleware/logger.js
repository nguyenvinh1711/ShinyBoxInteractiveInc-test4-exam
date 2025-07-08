import morgan from 'morgan';

const logger = morgan('combined')

// Extra logger middleware stub for candidate to enhance
export default (req, res, next) => {
    return logger(req, res, function (err) {
        if (err) return next(err)

        // todo: log IP address, user agent, etc.
        // console.log("logger middleware", req.originalUrl);

        next();
    });
};