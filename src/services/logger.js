const { createLogger, format, transports } = require('winston');

const { combine, timestamp, prettyPrint } = format;

/**
 *  
 *  levels: {
    error: 0,
    warn: 1,
    info: 2
    }
 * 
 *
 * 
 */
const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), prettyPrint()),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }), // error
    new transports.File({ filename: 'combined.log' }), // combined file for info and below
  ],
});

logger.add(
  new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
  })
);

module.exports = logger;
