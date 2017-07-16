const http = require('http');
const url = require('url');

function fetchUrl(urlToFetch) {
  return new Promise((resolve, reject) => {
    const options = Object.assign({ agent: false }, url.parse(urlToFetch));
    http
      .get(options, res => {
        let body = '';
        res.on('data', d => {
          body += d;
        });
        res.on('end', () => {
          resolve(body);
        });
      })
      .on('error', reject);
  });
}

module.exports = fetchUrl;
