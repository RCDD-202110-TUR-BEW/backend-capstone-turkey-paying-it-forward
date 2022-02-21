const { createLogger, format, transports } = require('winston');

const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // log file for error logs
    new transports.File({ filename: 'logs/combined.log' }), // combined log file for info and verbose logs
  ],
});

logger.add(
  new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
  })
);

module.exports = logger;
