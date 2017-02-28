const log = require('./logger')('request');
const request = require('request-promise');
const Throttle = require('generic-throttle');

const throttle = new Throttle(1, 1000);

module.exports = function loggedRequest(...args) {
  return throttle.acquire()
  .then(() => {
    log('Request: ', args);

    const requestArgs = args[0];
    const qs = requestArgs.qs
      ? Object.keys(requestArgs.qs).map(key => `${key}=${requestArgs.qs[key]}`).join('&')
      : '';

    log(`Request URL: ${requestArgs.uri}?${qs}`);
  })
  .then(() => request(...args))
  .catch((err) => {
    log('Request Error:', err, ...args);
    throw err;
  });
};
