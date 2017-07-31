const http = require('http');
const fs = require('fs');
const p = require('path');
const url = require('url');

function fetchUrl(urlToFetch) {
  const { hostname, port, path, protocol } = url.parse(urlToFetch);
  return new Promise((resolve, reject) => {
    if (protocol === 'file:') {
      fs.readFile(p.resolve(path), 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    } else {
      const options = {
        agent: false,
        hostname,
        port: port || 80,
        path,
        protocol,
      };
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
    }
  });
}

module.exports = fetchUrl;
