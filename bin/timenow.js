'use strict';
const app = require('commander');
const now = require(__dirname + '/../index.js');
app.version(require(__dirname + '/../package.json').version).usage('location or timezone');

now(app.parse(process.argv).args.join(' '));
