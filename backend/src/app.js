import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import fs from 'fs';

// import { getCookie } from './middleware/errorHandler.js';
import constants from "./configs/constants.js";
import registerRoutes from './routes/index.js';
import registerProcessHandlers from './utils/processHandler.js';

// Load .env might use later
// require('dotenv').config();

const app = express();

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(constants.ACCESS_LOG_PATH, { flags: 'a' })

app.use(cors({ origin: 'http://localhost:3000' })) // allow request only from frontend
    .use(json()) // POST and PUT requests are sent as JSON
    .use(morgan('combined', { stream: accessLogStream })) // Log requests to the file
    .use(morgan('dev')) // Log requests to the console 


// * Register Routes
registerRoutes(app);

// * Process exception handlers
registerProcessHandlers();

// ! temporary unused
// ? what is this function doing?
// getCookie();

export default app;