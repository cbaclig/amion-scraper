const log = require('../logger')('amion');
const Crawler = require('./crawler');

class Amion {
  static getICalScheduleForMonth(password, person, month) {
    return Crawler.init(password)
    .then(crawler => crawler.createSchedule(person, month))
    .then(monthSchedulePage => monthSchedulePage.clickICalLink())
    .then(downloadICalPage => downloadICalPage.getICal())
    .then(iCalString => ({
      person,
      iCalStrings: [iCalString],
    }));
  }

  static getSchedulesToFetch(password) {
    return Crawler.init(password)
    .then(crawler => crawler.getCreateSchedulePage())
    .then((createSchedulePage) => {
      const users = createSchedulePage.getUsers().slice(0, 20);
      const months = createSchedulePage.getMonths();

      log(`Found ${users.length * months.map} schedules to fetch`, {
        months,
        users: users.map(u => u.name),
      });

      return users.reduce((list, user) => list.concat(months.map(month => ({ user, month }))), []);
    });
  }
}

module.exports = Amion;
