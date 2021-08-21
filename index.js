/*
public domain
*/
'use strict';

const express = require('express');
const http = require('http');
const https = require('https');
const querystring = require('querystring');

function getCurrentTimeInSeconds() {
  return Date.now() * 0.001;
}

async function makeFormPostRequest(url, form) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(form);
    const req = https.request(url, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Content-Length': postData.length,
      },
    }, (res) => {
      let body = "";
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(body);
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    // Write data to request body
    req.write(postData);
    req.end();  
  });
}

let soundCloudToken;
let soundCloudRefreshToken; // not used
let soundCloudExpiredTimeInSeconds;

function isSoundCloudTokenValid() {
  if (!soundCloudToken) {
    return false;
  }
  return getCurrentTimeInSeconds() > soundCloudExpiredTimeInSeconds;
}

async function getSoundCloudToken(callback) {
  if (isSoundCloudTokenValid()) {
    return soundCloudToken;
  }

  const form = {
    client_id: process.env['CLIENT_ID'],
    client_secret: process.env['SECRET'],
    grant_type: 'client_credentials',
  };

  const json = await makeFormPostRequest('https://api.soundcloud.com/oauth2/token', form);
  const data = JSON.parse(json);
  soundCloudToken = data.access_token;
  soundCloudRefreshToken = data.refresh_token;
  soundCloudExpiredTimeInSeconds = data.expires_in + getCurrentTimeInSeconds() - 10;

  return soundCloudToken;
}

async function sendToken(req, res) {
  const token = await getSoundCloudToken();
  res.writeHead(200, {
    'Content-type': 'application/json',
  });
  res.end(JSON.stringify({
    token: token,
    expires_in: soundCloudExpiredTimeInSeconds - getCurrentTimeInSeconds(),
  }));
}

const app = express();
app.use(function (req, res, next) {
  if (req.url === '/token') {
    sendToken(req, res);
    return;
  }
  next();
});

app.use(express.static(process.cwd(), {index: 'index.html'}));

const hostname = '0.0.0.0';
const port = 8080;
const server = http.createServer(app);
server.on('error', (e) => {
  console.error(e);
});
server.on('listening', () => {
  console.log('server started on port:', port);
});
server.listen(port, hostname);
