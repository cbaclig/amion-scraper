const request = require('../request');
const cheerio = require('cheerio');

const BASE_URL = 'http://www.amion.com/cgi-bin/ocs';

const CreateSchedulePage = require('./pages/createSchedulePage');
const MonthSchedulePage = require('./pages/monthSchedulePage');

class Crawler {
  constructor(sessionToken) {
    this.sessionToken = sessionToken;
  }

  static init(password) {
    if (this.sessionToken) {
      return Promise.resolve(this.sessionToken);
    }

    return request({
      method: 'POST',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      form: { Login: password },
    })
    .then($ => new Crawler($('input[name=File]').val()));
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

  // TODO dudupe with createSchedulePage
  createSchedule(user, month) {
    // http://www.amion.com/cgi-bin/ocs?File=!54d8916alwuc]30&Page=Block&Rsel=302&Month=1-17
    return request({
      method: 'GET',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      qs: {
        File: this.sessionToken,
        Page: 'Block',
        Rsel: user.Rsel,
        Month: month,
      },
    })
    .then($ => new MonthSchedulePage($));
  }
}

module.exports = Crawler;
