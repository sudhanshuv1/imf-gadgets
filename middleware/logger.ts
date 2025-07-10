import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';

/**
 * Logs events to a specified log file with a timestamp and a unique identifier.
 * @param {string} message - The message to log.
 * @param {string} logFileName - The name of the log file.
 */
const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'ddMMyyyy\tHH:mm:ss');
    const logMessage = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logMessage);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Middleware to log HTTP requests.
 * Logs the request method, URL, and origin to a log file.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const logger = (req, res, next) => {
 logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'requestLog.log');
 console.log(`${req.method} ${req.path}`);
 next();
}

export { logEvents, logger };