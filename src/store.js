module.exports = function dataStore(config) {
  return {
    add(user, month, schedule) {
      (this.schedules = this.schedules || []).push(schedule);
    },

    getAllICals() {
      return this.schedules;
    }
  };
};
