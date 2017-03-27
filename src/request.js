const log = require('./logger')('request');
const request = require('request-promise');
const Throttle = require('generic-throttle');

const throttle = new Throttle(1, 1000);

module.exports = function loggedRequest(ctx, ...args) {
  return throttle.acquire()
  .then(() => {
    const requestArgs = args[0];
    const qs = requestArgs.qs
      ? Object.keys(requestArgs.qs).map(key => `${key}=${requestArgs.qs[key]}`).join('&')
      : '';

    log('HTTP Request: ', {
      ctx,
      httpRequest: Object.assign({}, args[0], {
        url: `${requestArgs.uri}?${qs}`,
      }),
    });
  })
  .then(() => request(...args))
  .catch((error) => {
    log('HTTP Request Error', {
      ctx,
      error,
      args,
    });

    throw error;
  });
};
