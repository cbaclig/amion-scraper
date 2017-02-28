const log = require('../logger')('amion');
const Crawler = require('./crawler');

class Amion {
  static getICalSchedules(password) {
    return Crawler.init(password)
    .then(crawler => crawler.getCreateSchedulePage())
    .then((createSchedulePage) => {
      // TODO Get all users months, not just first few
      const users = createSchedulePage.getUsers().splice(0, 1);
      const months = createSchedulePage.getMonths().splice(0, 1);

      log(`Users: ${users.length}`);

      return users.reduce((userPromise, person) => (
        userPromise
        .then(schedules => (
          months.reduce((monthsPromise, month) => (
            monthsPromise
            .then((iCalStrings) => {
              log(`Fetching ${month} schedule for ${person.name}`);

              return createSchedulePage.createSchedule(person, month)
              .then(monthSchedulePage => monthSchedulePage.clickICalLink())
              .then(downloadICalPage => downloadICalPage.getICal())
              .then(iCalString => iCalStrings.concat([iCalString]));
            })
          ), Promise.resolve([]))
          .then(iCalStrings => schedules.concat([{
            person,
            iCalStrings,
          }]))
        ))
      ), Promise.resolve([]));
    });
  }

  static getICalScheduleForMonth(token, person, month) {
    return new Crawler(token).createSchedule(person, month)
    .then(monthSchedulePage => monthSchedulePage.clickICalLink())
    .then(downloadICalPage => downloadICalPage.getICal())
    .then(iCalString => ({
      person,
      iCalStrings: [iCalString],
    }));
  }
}

module.exports = Amion;
