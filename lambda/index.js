const Main = require('../src/');

const Env = process.env;

exports.plan = (event, context, callback) => {
  Main.start(Env.AMION_PASSWORD).then(() => callback());
};

exports.processJob = (event, context, callback) => {
  Main.processJob(Env.AMION_PASSWORD).then(() => callback());
};

exports.reduce = (event, context, callback) => {
  Main.processSchedules(Env.AMION_PASSWORD).then(() => callback());
};
