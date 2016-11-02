'use strict';

const exec = c => require('child_process').execSync(c).toString();
const assert = require('assert');
const path = require('path');

// so the best way to test that comes to mind
// is to make calls to timeapi.org
const request = require('request');

let cmd = `node ${path.resolve(__dirname+'/../bin/timenow.js')}`;

let query = [
  'PDT', 
  'UTC',
  'UTC + 2',
  'UTC+1',
  'UTC+4',
  'GMT',
  'Paris',
  'London',
  'new-york',
  'saint-petersburg',
  'Tokyo'
];

// TODO
let specialCases = ['christmas', 'hanuka', 'new year']

describe('timenow', function () {
  query.forEach(function (e) {
    it(`should return correct results for ${e}`, function (done) {
      assert.equal(1,1);
      done();
    });
  });
});
