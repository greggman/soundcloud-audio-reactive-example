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

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    const headers = {};
    Object.assign(headers, options.headers || {});

    const data = options.data;
    if (data) {
      headers['Content-Length'] = data.length;
    }

    console.log('request:', url, `\n${JSON.stringify(headers, null, 2)}`);

    const req = https.request(url, {
      method,
      headers,
    }, (res) => {
      if (res.statusCode === 302) {
        const url = res.headers['location'];
        console.log('Redirect:', url);
        makeRequest(url, options)
          .then(data => resolve(data))
          .catch(err => reject(err));
        return;
      }
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

    if (data) {
      req.write(data);
    }
    req.end();  
  });
}

async function makeFormPostRequest(url, form) {
  return await makeRequest(url, {
    method: 'POST',
    data: querystring.stringify(form),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

async function makeGetRequest(url, token) {
  return await makeRequest(url, {
    headers: {
      'Authorization': `OAuth ${token}`,
    },
  });
}

let soundCloudToken;
let soundCloudRefreshToken; // not used
let soundCloudExpiredTimeInSeconds;

function isSoundCloudTokenValid() {
  if (!soundCloudToken) {
    return false;
  }
  return getCurrentTimeInSeconds() < soundCloudExpiredTimeInSeconds;
}

async function getSoundCloudToken(callback) {
  if (isSoundCloudTokenValid()) {
    console.log("using existing token as it has not expired. TTL:", soundCloudExpiredTimeInSeconds - getCurrentTimeInSeconds() | 0);
    return soundCloudToken;
  }

  console.log("getting new token from soundcloud");
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
  console.log("got token:", soundCloudToken);

  return soundCloudToken;
}

async function getTrackURL(req, res) {
  const url = req.query.url;
  console.log("get track url:", url);
  const token = await getSoundCloudToken();
  const resolveUrl = `https://api.soundcloud.com/resolve?${new URLSearchParams({
    format: 'json',
    url: url,
  })}`;
  const resolveData = await makeGetRequest(resolveUrl, token);
  const {stream_url} = JSON.parse(resolveData);
  console.log(resolveData)
  const trackUrl = `${stream_url}s`;
  const trackData = await makeGetRequest(trackUrl, token);
  const {http_mp3_128_url} = JSON.parse(trackData);

  res.writeHead(200, {
    'Content-type': 'application/json',
  });
  res.end(JSON.stringify({
    url: http_mp3_128_url,
  }));
}

const app = express();
app.use(function (req, res, next) {
  if (req.path === '/track_url') {
    getTrackURL(req, res);
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
