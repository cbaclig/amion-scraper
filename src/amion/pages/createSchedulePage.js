const request = require('../../request');
const cheerio = require('cheerio');

const BASE_URL = 'http://www.amion.com/cgi-bin/ocs';

const MonthSchedulePage = require('./monthSchedulePage');
const DownloadMonthSchedulePage = require('./downloadMonthSchedulePage');

function optionElToUser($el) {
  // Example val(): 264&Ui=16*5467*Last, First
  const [, Rsel, id] = $el.val().match(/^(\d+)&Ui=\d+\*(\d+)/);
  const [last, first] = $el.text().split(',').map(s => s.trim());

  return {
    id,
    Rsel,
    name: $el.text().trim(),
    first,
    last,
  };
}

class CreateSchedulePage {
  constructor($) {
    this.$ = $;
    this.sessionToken = $('input[name=File]').val();
  }

  getUsers() {
    const result = [];

    this.$('select[name=Rsel] option').each((i, el) => {
      const $el = this.$(el);

      if ($el.val() !== '-99') {
        result.push(optionElToUser($el));
      }
    });

    return result;
  }

  getMonths() {
    const result = [];

    this.$('select[name=Month] option').each((i, el) => {
      result.push(this.$(el).val());
    });

    return result;
  }

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

  // Guesses the URL of the download page
  // Can't skip because iCAL file isn't actually generated until the download page is hit...
  skipToDownloadMonth(user, month) {
    // https://www.amion.com/cgi-bin/ocs?File=!24e1832bivvb^21&Page=Block&Rsel=252&Mo=2-17&VCAL=2
    return request({
      method: 'GET',
      uri: BASE_URL,
      transform: body => cheerio.load(body),
      qs: {
        File: this.sessionToken,
        Page: 'Block',
        Rsel: user.Rsel,
        Mo: month,
        VCAL: 2,
      },
    })
    .then($ => new DownloadMonthSchedulePage($));
  }
}

module.exports = CreateSchedulePage;
