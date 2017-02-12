const log = require('./logger')('request');
const request = require('request-promise');
const Throttle = require('generic-throttle');

const throttle = new Throttle(1, 1000);

module.exports = function loggedRequest(...args) {
  return throttle.acquire()
  .then(() => {
    log('Request: ', args);
  })
  .then(() => request(...args))
  .catch((err) => {
    log('Request Error:', err, ...args);
    throw err;
  });
};
