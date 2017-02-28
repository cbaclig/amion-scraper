#!/usr/bin/env node

const scraper = require('./');

// console.log('hello world;');
// scraper.all();

// !54fb6707lwuc]30, 264, 2-17
scraper.storeICal('!54fb6707lwuc]30', { Rsel: 264 }, '2-17')
.then(() => storeSchedule);
