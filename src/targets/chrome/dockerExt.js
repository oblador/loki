const debug = require('debug')('loki:chrome:docker');
const os = require('os');
const path = require('path');
// const { execSync } = require('child_process');
const execa = require('execa');
const waitOn = require('wait-on');
const CDP = require('chrome-remote-interface');
const fs = require('fs-extra');
// const getRandomPort = require('get-port');
// const { ensureDependencyAvailable } = require('../../dependency-detection');
const createChromeTarget = require('./create-chrome-target');

const getLocalIPAddress = () => {
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

const waitOnCDPAvailable = (host, port) =>
  new Promise((resolve, reject) => {
    waitOn(
      {
        resources: [`tcp:${host}:${port}`],
        delay: 50,
        interval: 100,
        timeout: 5000,
      },
      err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });

function createChromeDockerExtTarget({
  baseUrl = 'http://localhost:6006',
  dockerHost = null,
  dockerPort = null
}) {
  let port = dockerPort;
  let host = dockerHost;
  let dockerUrl = baseUrl;

  if (!host || !port) {
    throw new Error('No dockerHost or dockerPort specified')
  }

  if (baseUrl.indexOf('http://localhost') === 0) {
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error('Unable to detect local IP address, try passing --host argument');
    }
    dockerUrl = baseUrl.replace('localhost', ip);
  } else if (baseUrl.indexOf('file:') === 0) {
    const staticPath = path.resolve(baseUrl.substr('file:'.length));
    const staticMountPath = '/var/loki';
    dockerUrl = `file://${staticMountPath}`;
  }

  async function start() {
    debug(`Connecting to docker "${host}:${port}"`)
    await waitOnCDPAvailable(host, port);
    debug(`Connected to docker "${host}:${port}"`);
  }

  // As we start the chrome docker image outside of loki
  // stopping will also happen outside of the container
  async function stop() {
    debug('Disconnected to docker');
  }

  async function createNewDebuggerInstance() {
    debug(`Launching new tab with debugger at port ${host}:${port}`);
    const target = await CDP.New({ host, port });
    debug(`Launched with target id ${target.id}`);
    const client = await CDP({ host, port, target });

    client.close = () => {
      debug('New closing tab');
      return CDP.Close({ host, port, id: target.id });
    };

    return client;
  }

  return createChromeTarget(
    start,
    stop,
    createNewDebuggerInstance,
    dockerUrl
  );
}

module.exports = createChromeDockerExtTarget;
