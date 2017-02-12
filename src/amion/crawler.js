const request = require('../request');
const cheerio = require('cheerio');

const CreateSchedulePage = require('./pages/createSchedulePage');

const BASE_URL = 'http://www.amion.com/cgi-bin/ocs';

class Crawler {
  init(password) {
    if (this.sessionToken) {
      return Promise.resolve(this.sessionToken);
    }

    return request({
      method: 'POST',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      form: { Login: password },
    })
    .then(($) => {
      this.sessionToken = $('input[name=File]').val();
    });
  }

  getCreateSchedulePage() {
    return request({
      method: 'GET',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      qs: {
        File: this.sessionToken,
        Page: 'MySel',
      },
    })
    .then($ => new CreateSchedulePage($));
  }
}

module.exports = new Crawler();
