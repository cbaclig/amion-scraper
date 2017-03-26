require('dotenv-safe').load();
const log = require('../src/logger')('lambda-main');
const AWS = require('aws-sdk');

const encrypted = process.env.AMION_PASSWORD;
let decrypted;

function decryptPassword() {
  if (decrypted) return Promise.resolve(decrypted);

  return new Promise((resolve, reject) => {
    // Decrypt code should run once and variables stored outside of the function
    // handler so that these are decrypted once per container
    const kms = new AWS.KMS({
      region: 'us-west-2',
      apiVersion: '2014-11-01',
    });
    kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (err, data) => {
      if (err) {
        log('Decrypt error:', err);
        reject(err);
      } else {
        resolve(data.Plaintext.toString('ascii'));
      }
    });
  });
}

const Main = require('../src/');

exports.plan = (event, context, callback) => {
  decryptPassword()
  .then(password => Main.start(password))
  .then(() => callback())
  .catch(log);
};

exports.processJob = (event, context, callback) => {
  decryptPassword()
  .then(password => Main.processJob(password))
  .then(() => callback())
  .catch(log);
};

exports.reduce = (event, context, callback) => {
  Main.processSchedules()
  .then(() => callback())
  .catch(log);
};
