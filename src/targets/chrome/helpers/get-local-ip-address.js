const os = require('os');

/**
 * Returns the first external IPv4 address this machine can be reached at.
 * @returns {String} The IPv4 address
 */
module.exports = function getLocalIPAddress () {
  const interfaces = os.networkInterfaces();
  const ips = Object.keys(interfaces)
    .map(key =>
      interfaces[key]
        .filter(({ family, internal }) => family === 'IPv4' && !internal)
        .map(({ address }) => address)
    )
    .reduce((acc, current) => acc.concat(current), []);
  return ips[0];
};
