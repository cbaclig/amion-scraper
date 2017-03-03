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
    return Amion.getSchedulesToFetch(amionPassword)
    .then(JobQueue.enqueue)
    .then(this.startNextJob.bind(this));
  },

  processJob() {
    return JobQueue.dequeue()
    .then((job) => {
      if (job) {
        return this.storeSchedule(job.user, job.month)
        .then(this.startNextJob.bind(this));
      }

      return this.processSchedules();
    });
  },

  startNextJob() {
    // return Lambda.createProcessJobTask();
    log('Starting next job...');
    return this.processJob();
  },

  storeSchedule(user, month) {
    return Amion.getICalScheduleForMonth(amionPassword, user, month)
    .then(schedule => scheduleStore.add(user, month, schedule))
    .then(() => log(`Done storing schedule for ${user.id} on ${month}!`));
  },

  processSchedules() {
    // TODO don't replace the s3 file if there are no schedules?
    return scheduleStore.inspect()
    .then(scheduleStore.getAll.bind(scheduleStore))
    .then(Translator.ingestICalSchedules)
    .then(S3.uploadJSONData)
    .then(() => log('Done!'));
  },
};
