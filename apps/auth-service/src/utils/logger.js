const winston = require('winston');
const config = require('../config/env');

const readableFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const extraData = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

  return `${timestamp} ${level}: ${message}${extraData}`;
});

const loggerFormat =
  config.nodeEnv === 'production'
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(winston.format.timestamp(), winston.format.colorize(), readableFormat);

const logger = winston.createLogger({
  level: 'info',
  silent: config.nodeEnv === 'test',
  format: loggerFormat,
  transports: [new winston.transports.Console()],
});

module.exports = logger;
