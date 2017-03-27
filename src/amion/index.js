const log = require('../logger')('amion');
const Crawler = require('./crawler');

class Amion {
  static getICalScheduleForMonth(ctx, password, person, month) {
    return Crawler.init(ctx, password)
    .then(crawler => crawler.createSchedule(person, month))
    .then(monthSchedulePage => monthSchedulePage.clickICalLink())
    .then(downloadICalPage => downloadICalPage.getICal())
    .then(iCalString => ({
      person,
      iCalStrings: [iCalString],
    }));
  }

  static getSchedulesToFetch(ctx, password) {
    return Crawler.init(ctx, password)
    .then(crawler => crawler.getCreateSchedulePage())
    .then((createSchedulePage) => {
      const users = createSchedulePage.getUsers().slice(0, 1);
      const months = createSchedulePage.getMonths();

      log(`Found ${users.length * months.length} schedules to fetch`, {
        ctx,
        months,
        users: users.map(u => u.name),
      });

      return users.reduce((list, user) => list.concat(months.map(month => ({ user, month }))), []);
    });
  }
}

module.exports = Amion;
