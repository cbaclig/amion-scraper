const log = require('./logger')('job-queue');
const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  endpoint: `https://sqs.${process.env.AWS_S3_REGION}.amazonaws.com`,
  region: process.env.AWS_S3_REGION,
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

  dequeue(ctx, fn) {
    return new Promise((resolve, reject) => {
      sqs.receiveMessage({
        QueueUrl: QUEUE_URL,
      }, (err, data) => (err ? reject(err) : resolve(data)));
    })
    .then((data) => {
      const { Messages } = data;

      log(`Received message ${Messages && Messages.length ? '' : 'no '}data`, { ctx });

      if (Messages && Messages.length) {
        const [{ ReceiptHandle, Body }] = Messages;

        return fn(JSON.parse(Body))
        .then(() => new Promise((resolve, reject) => {
          log(`Deleting message ${ReceiptHandle} from queue data`, { ctx });

          sqs.deleteMessage({
            QueueUrl: QUEUE_URL,
            ReceiptHandle,
          }, err => (err ? reject(err) : resolve()));
        }));
      }

      return fn();
    });
  },
};
