const log = require('./logger')('lambda');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  endpoint: `https://lambda.${process.env.AWS_S3_REGION}.amazonaws.com`,
  region: process.env.AWS_S3_REGION,
});

module.exports = {
  executeProcessJob(ctx) {
    log('Invoking Lambda processJob function', { ctx });

    // TODO check for 202
    // > { StatusCode: 202, Payload: '' }
    return lambda.invoke({
      FunctionName: 'amion-scraper-processJob',
      InvocationType: 'Event',
    }).promise();
  },
};
