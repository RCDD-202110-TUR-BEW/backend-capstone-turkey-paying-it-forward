const express = require('express');
const { checkServerStatusJob, newsLetterJob } = require('./cron');
const logger = require('./logger');

const app = express();
checkServerStatusJob();
newsLetterJob();
app.listen(process.env.CRON_LOCAL_PORT, () => {
  logger.info('cron jobs are running');
});
