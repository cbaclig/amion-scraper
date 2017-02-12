const debug = require('debug');

module.exports = function wrappedDebug(moduleName) {
  return debug(`amion-scraper:${moduleName}`);
};
