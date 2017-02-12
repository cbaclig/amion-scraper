const log = require('./logger')('ical');
const ical = require('ical');
const Throttle = require('generic-throttle');

const throttle = new Throttle(1, 1000);

module.exports = Object.assign(ical, {
  fromURLPromise(url, opts) {
    return throttle.acquire()
    .then(() => log('Fetching iCal: ', url))
    .then(() => (
      new Promise((resolve, reject) => {
        ical.fromURL(url, opts, (err, data) => {
          if (err) {
            reject(err);
          } else {
            log(data);
            resolve(data);
          }
        });
      })
    ));
  },
});
