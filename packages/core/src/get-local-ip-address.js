const os = require('os');

const getLocalIPAddress = () => {
  const interfaces = os.networkInterfaces();
  const ips = Object.keys(interfaces)
    .map((key) =>
      interfaces[key]
        .filter(({ family, internal }) => family === 'IPv4' && !internal)
        .map(({ address }) => address)
    )
    .reduce((acc, current) => acc.concat(current), []);
  return ips[0];
};

module.exports = { getLocalIPAddress };
