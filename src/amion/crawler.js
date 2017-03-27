const request = require('../request');
const cheerio = require('cheerio');

const BASE_URL = 'http://www.amion.com/cgi-bin/ocs';

const CreateSchedulePage = require('./pages/createSchedulePage');
const MonthSchedulePage = require('./pages/monthSchedulePage');

class Crawler {
  constructor(ctx, sessionToken) {
    this.ctx = ctx;
    this.sessionToken = sessionToken;
  }

  static init(ctx, password) {
    if (!password) {
      throw new Error('Amion password required for Crawler.init()!');
    }

    if (this.sessionToken) {
      return Promise.resolve(this.sessionToken);
    }

    return request(ctx, {
      method: 'POST',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      form: { Login: password },
    })
    .then($ => new Crawler(ctx, $('input[name=File]').val()));
  }

  getCreateSchedulePage() {
    return request(this.ctx, {
      method: 'GET',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      qs: {
        File: this.sessionToken,
        Page: 'MySel',
      },
    })
    .then($ => new CreateSchedulePage(this.ctx, $));
  }

  // TODO dudupe with createSchedulePage
  createSchedule(user, month) {
    // http://www.amion.com/cgi-bin/ocs?File=!54d8916alwuc]30&Page=Block&Rsel=302&Month=1-17
    return request(this.ctx, {
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
