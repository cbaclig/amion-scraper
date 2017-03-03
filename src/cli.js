#!/usr/bin/env node

const scraper = require('./');

// console.log('hello world;');
// scraper.all();

// !54fb6707lwuc]30, 264, 2-17

scraper.start().then(() => console.log('Done with CLI')).catch(console.log.bind(console));

// scraper.processJob().then(() => console.log('Done with CLI')).catch(console.log.bind(console));

// scraper.processSchedules().then(() => console.log('Done with CLI')).catch(console.log.bind(console));
