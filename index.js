'use strict';

const moment = require('moment-timezone');
const tz = require('timezones.json');
const colors = require('colors');
const request = require('request');

const showFirst = {
  "pdt": "Pacific Standard Time",
  "pst": "Pacific Standard Time",
  "est": "Eastern Standard Time",
  "edt": "Eastern Standard Time"
};

/**
 * ask google for location
 * @param {String} q - query
 */
const findLocation = q => new Promise((res, rej) => {
  request.get({
    url: `http://maps.googleapis.com/maps/api/geocode/json?address=${q}&sensor=false`,
    json: true
  }, (err, r, loc) => {
    if(err || (!loc.results || !loc.results.length)) rej();
    res(loc.results);
  });
});

/**
 * ask google for timezone
 * @param {String} q - query
 */
const findTimezone = l => new Promise((res, rej) => {
  request.get({
    url: `https://maps.googleapis.com/maps/api/timezone/json?location=${l.geometry.location.lat},${l.geometry.location.lng}&timestamp=1331161200&sensor=false`,
    json: true
  }, (err, r, tz) => {
    if(err || !tz.timeZoneId) rej();
    
    tz.name = l['formatted_address'];
    res(tz);
  });
});


/**
 * Query fn
 * @param {Object} q - query object
 */
const query = q => {
  let res = [];

  if (q.timezone) {
    res = res.concat(tz.filter(t => t.abbr.toLowerCase() === q.timezone.toLowerCase()))
    .concat(
      tz.filter(t => t.value.toLowerCase()
          .replace(/\(.*\)/, '')
          .split(' ').map(e => e[0]).join('') === q.timezone.toLowerCase())
    );
  }

  if (q.location) {
    res = res.concat(tz.filter(t => {
      if(t.utc)
        return !!t.utc.map(e => e.toLowerCase().replace('_', '').split('/'))
          .filter(e => {
            return ~e.indexOf(q.location.replace(/[_-]/g, ''))
          }).length;

      return false;
    }));

    // in case of la ny etc...
    if(q.location.length === 2) {
      res = res.concat(tz.filter(t => {
        if(t.utc) {
          let _location = t.utc.filter(e => ~e.indexOf('_'));
          
          if (!_location.length) {
            return false;
          } else {
            return _location.map(l => l.toLowerCase().split('/')[1].split('_'))
              .filter(l => l.length > 1 && l[0][0] === q.location[0] && l[1][0] === q.location[1]).length;
          }
        }

        return false;
      }));
    }
  }

  if (q.id) {
    res = res.concat(tz.filter(t => t.utc? ~t.utc.indexOf(q.id) : false));
  }

  return res;
};


/**
 * default output format
 */
const _format = 'h:mm:ss a, MMMM Do YYYY';

/**
 * output result
 * @param {Object} tz - timezone object
 */
let output = tz => console.log(`${moment().tz(tz.utc[0]).format(_format).white} — ${tz.text.green}`);

/**
 * time in different places
 * @param {String} q - query 
 */
let now = q => {
  if (!q) return console.log(moment().format(_format).white);

  q = q.trim().replace(/[^a-zA-Z]/, '').toLowerCase();
  
  let t = query({
    timezone: q,
    location: q
  });

  if (t.length) {
    if (t.length > 1) {
      // if we have some top choice
      // that we want to show first
      if(showFirst[q]) {
        let top = t.findIndex(e => e.value === showFirst[q]);

        if (~top) {
          output(t[top]);
          t.splice(top, 1);
          console.log('Also found:'.yellow);
        } else {
          console.log('Found multiple choices:'.yellow);
        }
      } else {
        console.log('Found multiple choices:'.yellow);
      }
    }

    t.map(output);
  } else {
    // make request to google
    findLocation(q).then(l => {
      Promise.all(l.map(findTimezone)).then(r => r.map(e => {
        console.log(`${e.name}:`.yellow);
        output(query({id: e.timeZoneId})[0]);
        console.log('');
      }))
      .catch(() => console.log('Nothing found'.yellow));
    }).catch(() => console.log('Nothing found'.yellow));
  }
};

module.exports = now;
