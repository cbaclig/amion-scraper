const log = require('./logger')('translator');
const moment = require('moment');
const ical = require('ical');
const _ = require('lodash');
const { RRule, RRuleSet } = require('rrule-alt');

module.exports = {
  ingestICalSchedules(ctx, schedules) {
    const people = {};

    const dateMap = schedules.reduce((scheduleDateMap, schedule) => {
      people[schedule.person.id] = schedule.person;

      return schedule.iCalStrings.reduce((icalDateMap, iCalString) => {
        const events = _.reduce(ical.parseICS(iCalString), (acc, event) => {
          if (!acc[event.summary]) Object.assign(acc, { [event.summary]: new RRuleSet() });

          if (event.rrule) {
            log('Adding recurring event', {
              ctx,
              event,
            });
            acc[event.summary].rrule(new RRule(event.rrule.origOptions));
          } else {
            log('Adding single event', {
              ctx,
              event,
            });
            acc[event.summary].rdate(event.start);
          }

          return acc;
        }, {});

        return _.reduce(events, (eventDateMap, rruleSet, eventName) => (
          rruleSet.all().reduce((acc, date) => {
            const dateKey = moment(date).format('YYYY-MM-DD');

            if (!acc[dateKey]) Object.assign(acc, { [dateKey]: [] });

            acc[dateKey].push({
              eventName,
              personId: schedule.person.id,
            });

            return acc;
          }, eventDateMap)
        ), icalDateMap);
      }, scheduleDateMap);
    }, {});

    return {
      people,
      schedule: dateMap,
    };
  },
};
