const http = require('http');
const url = require('url');

function fetchUrl(urlToFetch) {
  return new Promise(resolve => {
    http.get(url.parse(urlToFetch), res => {
      let body = '';
      res.on('data', d => {
        body += d;
      });
      res.on('end', () => {
        resolve(body);
      });
    });
  });
}

module.exports = fetchUrl;
