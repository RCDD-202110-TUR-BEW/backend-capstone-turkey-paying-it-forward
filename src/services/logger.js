const winston = require('winston');

/**
 *  Error: important events that will be cause the program execution to fail
    Warn: crucial events that should be noticed to prevent fails
    Info: important events that details a completed task
    Debug: mostly used by developers

    levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
    }
 * 
 */
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(winston.format.colorize()),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // error
    new winston.transports.File({ filename: 'combined.log' }), // combined file for all logs
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  })
);

module.exports = logger;
