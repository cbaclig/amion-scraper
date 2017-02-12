require('dotenv-safe').load();
const log = require('./logger')('main');
const S3 = require('./s3');
const Amion = require('./amion');
const Translator = require('./translator');

const amionPassword = process.argv[2];

if (!amionPassword) {
  throw new Error('Amion password required as an argument!');
}

Amion.getICalSchedules(amionPassword)
.then(Translator.ingestICalSchedules)
.then(S3.uploadJSONData)
.then(() => log('Done!'));
