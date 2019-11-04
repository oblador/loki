const getAbsoluteURL = require('./get-absolute-url');

const getReactUri = (reactUri, host, port, useRelativePath) => {
  let uri = reactUri;

  if (!useRelativePath) {
    uri = getAbsoluteURL(uri);
  }

  return uri || `http://${host}:${port}`;
};

module.exports = getReactUri;
