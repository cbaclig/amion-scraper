const log = require('./logger')('lambda');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({
  endpoint: 'https://lambda.us-west-2.amazonaws.com',
  region: 'us-west-2',
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
