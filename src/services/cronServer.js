const express = require('express');
const { checkServerStatusJob, newsletterJob } = require('./cron');
const logger = require('./logger');

const app = express();
checkServerStatusJob();
newsletterJob();
app.listen(process.env.CRON_LOCAL_PORT, () => {
  logger.info('cron jobs are running');
});
