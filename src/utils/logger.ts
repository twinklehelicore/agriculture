// src/utils/logger.ts
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, json, prettyPrint, colorize, simple } = format;

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        simple()
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ]
});

export default logger;
