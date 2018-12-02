const debug = require('debug')('loki:chrome:existing');
const CDP = require('chrome-remote-interface');
const serveHandler = require('serve-handler');
const http = require('http');
const Promise = require('bluebird');
const waitOnCDPAvailable = require('./helpers/wait-on-CDP-available');
const getLocalIPAddress = require('./helpers/get-local-ip-address');
const createChromeTarget = require('./create-chrome-target');

const SERVER_STARTUP_TIMEOUT = 10000 /* ms */;

function createChromeDockerTarget({
  baseUrl = 'http://localhost:6006',
  chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
  chromeDockerHost = 'localhost',
  chromeDockerPort = '9222',
}) {
  let storybookUrl = baseUrl;

  const RUN_MODES = {
    local: 'local',
    remote: 'remote',
    file: 'file'
  }

  let runMode = RUN_MODES.remote
  if (baseUrl.indexOf('http://localhost') === 0) {
    runMode = RUN_MODES.local
  } else if (baseUrl.indexOf('file:') === 0) {
    runMode = RUN_MODES.file
  }
  debug(`Running in ${runMode} mode`);

  let server;
  let storybookPort;
  let storybookHost;
  if (runMode === RUN_MODES.file) {
    const staticPath = baseUrl.substr('file:'.length);
    storybookPort = 8080;
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }
    storybookUrl = `http://${ip}:${storybookPort}`;
    storybookHost = ip;
    server = http.createServer((req, res) => serveHandler(req, res, {public: staticPath}))
    debug(`Serving files from ${staticPath}`);
  }

  if (runMode === RUN_MODES.local) {
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }
    storybookUrl = baseUrl.replace('localhost', ip);
  }

  debug(`Looking for storybook at ${storybookUrl}`);

  let dockerHost = chromeDockerHost
  if (chromeDockerHost.indexOf('localhost') === 0) {
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }
    dockerHost = chromeDockerHost.replace('localhost', ip);
  }

  async function start() {
    debug(`Trying to connect to Chrome at http://${dockerHost}:${chromeDockerPort}`)
    if (server) {
      debug(`Serving storybook at http://${storybookHost}:${storybookPort}`)
      server.listen({host: storybookHost, port: storybookPort})
      await Promise.all([
        waitOnCDPAvailable(dockerHost, chromeDockerPort),
        new Promise((resolve, reject) => {
          server.addListener('listening', resolve);
          server.addListener('error', reject);
        }).timeout(SERVER_STARTUP_TIMEOUT)
      ]);
      debug('Set up complete')
    } else {
      await waitOnCDPAvailable(dockerHost, chromeDockerPort);
    }
  }

  async function stop() {
    if (server) {
      const serverClosed = new Promise((resolve, reject) => {
        server.on('close', resolve);
        server.on('error', reject);
      });
      server.close();
      await serverClosed;
    }
  }

  async function createNewDebuggerInstance() {
    debug(`Launching new tab with debugger at port ${dockerHost}:${chromeDockerPort}`);
    const target = await CDP.New({ host: dockerHost, port: chromeDockerPort });
    debug(`Launched with target id ${target.id}`);
    const client = await CDP({ host: dockerHost, port: chromeDockerPort, target });

    client.close = () => {
      debug('New closing tab');
      return CDP.Close({ host: dockerHost, port: chromeDockerPort, id: target.id });
    };

    return client;
  }

  return createChromeTarget(
    start,
    stop,
    createNewDebuggerInstance,
    storybookUrl
  );
}

module.exports = createChromeDockerTarget;
