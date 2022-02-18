const express = require('express');
const { checkServerStatusJob, newsLetterJob } = require('./cron');

const app = express();
checkServerStatusJob();
newsLetterJob();
app.listen(process.env.CRON_LOCAL_PORT, () => {
  console.log('cron jobs are running');
});
