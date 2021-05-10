import { resolve } from 'path';
import winston from 'winston';

let transports = [
    new winston.transports.File({
        filename: resolve('logs/error.log'),
        level: 'error',
    }),
    new winston.transports.File({ filename: resolve('logs/combined.log') }),
];
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: transports,
});

module.exports = logger;