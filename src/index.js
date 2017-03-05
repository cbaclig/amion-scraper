require('dotenv-safe').load();
const log = require('./logger')('main');
const S3 = require('./s3');
const Amion = require('./amion');
const Translator = require('./translator');
const scheduleStore = require('./store')({});
const JobQueue = require('./job_queue');
const Lambda = require('./lambda');

module.exports = {
  all(amionPassword) {
    return Amion.getICalSchedules(amionPassword)
    .then(Translator.ingestICalSchedules)
    .then(S3.uploadJSONData)
    .then(() => log('Done!'));
  },

  start(amionPassword) {
    return Amion.getSchedulesToFetch(amionPassword)
    .then(JobQueue.enqueue)
    .then(this.executeProcessJob.bind(this, amionPassword));
  },

  processJob(amionPassword) {
    return JobQueue.dequeue()
    .then((job) => {
      if (job) {
        return this.storeSchedule(amionPassword, job.user, job.month)
        .then(this.executeProcessJob.bind(this, amionPassword));
      }

      return this.processSchedules();
    });
  },

  executeProcessJob() {
    return Lambda.executeProcessJob();
  },

  // executeProcessJob(amionPassword) {
  //   return this.processJob(amionPassword);
  // },

  storeSchedule(amionPassword, user, month) {
    return Amion.getICalScheduleForMonth(amionPassword, user, month)
    .then(schedule => scheduleStore.add(user, month, schedule))
    .then(() => log(`Done storing schedule for ${user.id} on ${month}!`));
  },

  processSchedules() {
    // TODO don't replace the s3 file if there are no schedules?
    return scheduleStore.getAll(scheduleStore)
    .then(Translator.ingestICalSchedules)
    .then(S3.uploadJSONData)
    .then(() => log('Done!'));
  },
};
