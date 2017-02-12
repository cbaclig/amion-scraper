const request = require('../../request');
const cheerio = require('cheerio');

const BASE_URL = 'http://www.amion.com/cgi-bin/ocs';

const DownloadMonthSchedulePage = require('./downloadMonthSchedulePage');

class MonthSchedulePage {
  constructor($) {
    this.$ = $;
    this.sessionToken = $('input[name=File]').val();
  }

  clickICalLink() {
    const qs = this.$('a[href*="VCAL=2"]').attr('href').split('?')[1].split('&').reduce((acc, pair) => {
      const [key, val] = pair.split('=');
      return Object.assign(acc, { [key]: val });
    }, {});

    return request({
      method: 'GET',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      qs,
    })
    .then($ => new DownloadMonthSchedulePage($));
  }
}

module.exports = MonthSchedulePage;
