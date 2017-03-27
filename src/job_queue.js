const log = require('./logger')('job-queue');
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  endpoint: 'https://sqs.us-west-2.amazonaws.com',
  region: 'us-west-2',
});

const QUEUE_URL = 'https://sqs.us-west-2.amazonaws.com/877478752829/amion-scraper-jobs.fifo';
const MESSAGE_GROUP_ID = 'jobs';

module.exports = {
  enqueue(ctx, jobs) {
    log(`Enqueuing ${jobs.length} jobs`, { ctx });

    // TODO sendBatchMessage 1o at a time
    // TODO handle/log errors
    return jobs.reduce((promise, job) => (
      promise.then(() => (new Promise((resolve, reject) => {
        sqs.sendMessage({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(job),
          MessageGroupId: MESSAGE_GROUP_ID,
          MessageDeduplicationId: `${job.user.id}_${job.month}`,
        }, err => (err ? reject(err) : resolve()));
      })))
    ), Promise.resolve());
  },

  dequeue(ctx) {
    return new Promise((resolve, reject) => {
      sqs.receiveMessage({
        QueueUrl: QUEUE_URL,
      }, (err, data) => (err ? reject(err) : resolve(data)));
    })
    .then(data => new Promise((resolve, reject) => {
      const { Messages } = data;

      log(`Received ${Messages && Messages.length ? '' : 'no '}data`, { ctx });

      if (Messages && Messages.length) {
        const [{ ReceiptHandle, Body }] = Messages;

        sqs.deleteMessage({
          QueueUrl: QUEUE_URL,
          ReceiptHandle,
        }, err => (err ? reject(err) : resolve(JSON.parse(Body))));
      } else {
        resolve();
      }
    }));
  },
};
