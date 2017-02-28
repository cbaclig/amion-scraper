require('dotenv-safe').load();
const log = require('./logger')('main');
const S3 = require('./s3');
const Amion = require('./amion');
const Translator = require('./translator');
const scheduleStore = require('./store')({});
const JobQueue = require('./job_queue');
const Lambda = require('./lambda');

const amionPassword = process.argv[2];

if (!amionPassword) {
  throw new Error('Amion password required as an argument!');
}

module.exports = {
  all() {
    return Amion.getICalSchedules(amionPassword)
    .then(Translator.ingestICalSchedules)
    .then(S3.uploadJSONData)
    .then(() => log('Done!'));
  },

  start() {
    return Amion.getSchedulesToFetch()
    .then(JobQueue.enque)
    .then(this.startNextJob);
  },

  processJob() {
    return JobQueue.dequeue()
    .then((job) => {
      if (job) {
        return this.storeSchedule(job.token, job.user, job.month)
        .then(() => this.startNextJob);
      }

      return this.processSchedules();
    });
  },

  startNextJob() {
    return Lambda.createProcessJobTask();
  },

  storeSchedule(token, user, month) {
    return Amion.getICalScheduleForMonth(token, user, month)
    .then(schedule => scheduleStore.add(user, month, schedule))
    .then(() => log('Done!'));
  },

  processSchedules() {
    return scheduleStore.getAll()
    .then(Translator.ingestICalSchedules)
    .then(S3.uploadJSONData)
    .then(() => log('Done!'));
  },
};
