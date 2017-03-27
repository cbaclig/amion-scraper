require('dotenv-safe').load();
const log = require('./logger')('main');
const S3 = require('./s3');
const Amion = require('./amion');
const Translator = require('./translator');
const scheduleStore = require('./store')({});
const JobQueue = require('./job_queue');
const Lambda = require('./lambda');

module.exports = {
  start(ctx, amionPassword) {
    return Amion.getSchedulesToFetch(ctx, amionPassword)
    .then(JobQueue.enqueue.bind(null, ctx))
    .then(this.executeProcessJob.bind(this, ctx, amionPassword));
  },

  processJob(ctx, amionPassword) {
    return JobQueue.dequeue(ctx)
    .then((job) => {
      if (job) {
        return this.storeSchedule(ctx, amionPassword, job.user, job.month)
        .then(this.executeProcessJob.bind(this, ctx, amionPassword));
      }

      return this.loadSchedules(ctx);
    });
  },

  executeProcessJob(ctx) {
    return Lambda.executeProcessJob(ctx);
  },

  storeSchedule(ctx, amionPassword, user, month) {
    return Amion.getICalScheduleForMonth(ctx, amionPassword, user, month)
    .then(schedule => scheduleStore.add(ctx, user, month, schedule))
    .then(() => log(`Done storing schedule for ${user.id} on ${month}!`, { ctx }));
  },

  loadSchedules(ctx) {
    // TODO don't replace the s3 file if there are no schedules?
    return scheduleStore.getAll(ctx, scheduleStore)
    .then(Translator.ingestICalSchedules.bind(null, ctx))
    .then(S3.uploadJSONData.bind(null, ctx))
    .then(() => log('Done loading schedules into S3', { ctx }));
  },
};
