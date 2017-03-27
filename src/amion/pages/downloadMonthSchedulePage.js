const request = require('../../request');

const BASE_URL = 'http://www.amion.com/cgi-bin/';

class DownloadMonthSchedulePage {
  constructor(ctx, $) {
    this.ctx = ctx;
    this.$ = $;
  }

  getICal() {
    return request(this.ctx, {
      method: 'GET',
      uri: BASE_URL + this.$('a[href*=".ics"]').attr('href'),
    });
  }
}

module.exports = DownloadMonthSchedulePage;
