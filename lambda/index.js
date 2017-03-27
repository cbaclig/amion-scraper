require('dotenv-safe').load();
const log = require('../src/logger')('lambda-main');
const AWS = require('aws-sdk');

const encrypted = process.env.AMION_PASSWORD;
let decrypted;

function decryptPassword(ctx) {
  if (decrypted) return Promise.resolve(decrypted);

  return new Promise((resolve, reject) => {
    // Decrypt code should run once and variables stored outside of the function
    // handler so that these are decrypted once per container
    const kms = new AWS.KMS({
      region: 'us-west-2',
      apiVersion: '2014-11-01',
    });
    kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (error, data) => {
      if (error) {
        log('Decrypt error', {
          ctx,
          error: {
            message: error.message,
            stack: error.stack,
          },
        });
        reject(error);
      } else {
        resolve(data.Plaintext.toString('ascii'));
      }
    });
  });
}

function toCtx(context) {
  return {
    lambdaRequestId: context.awsRequestId,
  };
}

const Main = require('../src/');

exports.plan = (event, context, callback) => {
  const ctx = toCtx(context);

  decryptPassword(ctx)
  .then(password => Main.start(ctx, password))
  .then(() => callback())
  .catch(error => log('Error in Lambda.plan()', {
    ctx,
    error: {
      message: error.message,
      stack: error.stack,
    },
  }));
};

exports.processJob = (event, context, callback) => {
  const ctx = toCtx(context);

  decryptPassword()
  .then(password => Main.processJob(ctx, password))
  .then(() => callback())
  .catch(error => log('Error in Lambda.processJob()', {
    ctx,
    error: {
      message: error.message,
      stack: error.stack,
    },
  }));
};
