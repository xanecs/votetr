'use strict';
const config = require('./config.json');
const FB = require('fb');
const request = require('request');
const fs = require('fs');

const fbIds = ['10154325078698083', '10154325078883083', '10154325078893083'];
const instaIds = ['BGBcOACtvP7', 'BGBcj9TNvAW', 'BGBcY1oNvAE']

FB.api('oauth/access_token', {
    client_id: config.app_id,
    client_secret: config.app_secret,
    grant_type: 'client_credentials'
}, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }

    FB.setAccessToken(res.access_token);
    startLoop();
});

function startLoop() {
  let fbData = {};
  let instaData = {};
  let fbReady = false;
  let instaReady = false;
  queryFb(res => {
    fbData = res;
    fbReady = true;
    if (fbReady && instaReady) writeLine(fbData, instaData);
  });
  queryInsta(res => {
    instaData = res;
    instaReady = true;
    if (fbReady && instaReady) writeLine(fbData, instaData);
  });
}

function writeLine(fbData, instaData) {
  const time = +new Date();
  fs.appendFile('./out.csv', `${time},${fbData[fbIds[0]]},${instaData[instaIds[0]]},${fbData[fbIds[1]]},${instaData[instaIds[1]]},${fbData[fbIds[2]]},${instaData[instaIds[2]]}\n`, err => {
    if(err) console.log(err);
    setTimeout(startLoop, 10000);
  });

}

function querySingleFb(id, cb) {
  FB.api(id, {fields: ['likes.summary(true)']}, (res) => {
    cb(res.likes.summary.total_count);
  });
}

function queryFb(cb) {
  let fin = 0;
  let results = {}
  for (let fbId of fbIds) {
    querySingleFb(fbId, (res) => {
      fin++;
      results[fbId] = res;
      if (fin >= fbIds.length) {
        cb(results);
      }
    })
  }
}

function queryInsta(cb) {
  request('https://www.instagram.com/volksbankbuehl/media/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      let result = {};
      for (let code of instaIds) {
        for (let item of data.items) {
          if (item.code != code) continue;
          result[code] = item.likes.count;
        }
      }
      cb(result);
    }
  });
}
