const _ = require('lodash');
const { Logger, transports: { Console } } = require('winston');

module.exports = function wrappedDebug(module) {
  const logger = new Logger({
    level: 'info',
    transports: [
      new (Console)({
        json: true,
        stringify: true,
        handleExceptions: true,
      }),
    ],
  });

  [
    'error',
    'warn',
    'info',
    'verbose',
    'debug',
    'silly',
  ].forEach((method) => {
    const originalMethod = logger[method];
    logger[method] = function logMethod(message, meta = {}) {
      const newMeta = _.defaultsDeep({}, meta, {
        ctx: {
          app: 'amion-scraper',
          module,
        },
      });

      return originalMethod(message, newMeta);
    };
  });

  return logger.info.bind(logger);
};
