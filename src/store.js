const log = require('./logger')('store');
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  endpoint: 'https://sqs.us-west-2.amazonaws.com',
  region: 'us-west-2',
});

const QUEUE_URL = 'https://sqs.us-west-2.amazonaws.com/877478752829/amion-scraper-job-results.fifo';
const MESSAGE_GROUP_ID = 'results';

module.exports = function dataStore() {
  return {
    add(user, month, schedule) {
      return sqs.sendMessage({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(schedule),
        MessageGroupId: MESSAGE_GROUP_ID,
        MessageDeduplicationId: `${user.id}_${month}`,
      }).promise();
    },

    getAll() {
      const schedules = [];

      function getScheduleChunk() {
        return sqs.receiveMessage({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          // ReceiveRequestAttemptId: TODO look into using this to recover from network failures
        }).promise().then(({ Messages }) => {
          if (Messages && Messages.length) {
            log(`Recevied ${Messages.length} messages`);

            schedules.push(...Messages.map(({ Body }) => JSON.parse(Body)));

            log(`Deleting ${Messages.length} messages`);

            return sqs.deleteMessageBatch({
              QueueUrl: QUEUE_URL,
              Entries: Messages.map(({ ReceiptHandle }, i) => ({
                Id: i.toString(),
                ReceiptHandle,
              })),
            }).promise().then(getScheduleChunk);
          }

          // we're done!
          return schedules;
        });
      }

      return getScheduleChunk();
    },
  };
};
