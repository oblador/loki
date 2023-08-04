const debug = require('debug')('loki:chrome:app');
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const getRandomPort = require('find-free-port-sync');
const {
  getAbsoluteURL,
  getLocalIPAddress,
  createStaticServer,
} = require('@loki/core');
const { createChromeTarget } = require('@loki/target-chrome-core');

function createChromeAppTarget({
  baseUrl = 'http://localhost:6006',
  chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
}) {
  let instance;
  let staticServer;
  let staticServerPath;
  let staticServerPort;

  let chromeUrl = getAbsoluteURL(baseUrl);
  const isLocalFile = chromeUrl.indexOf('file:') === 0;

  if (chromeUrl.indexOf('http://localhost') === 0 || isLocalFile) {
    const ip = getLocalIPAddress();

    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }

    if (isLocalFile) {
      staticServerPort = getRandomPort();
      staticServerPath = chromeUrl.substr('file:'.length);
      chromeUrl = `http://${ip}:${staticServerPort}`;
    } else {
      chromeUrl = chromeUrl.replace('localhost', ip);
    }
  }

  async function start(options = {}) {
    if (isLocalFile) {
      staticServer = createStaticServer(staticServerPath);
      staticServer.listen(staticServerPort);
      debug(`Starting static file server at ${chromeUrl}`);
    }
    const launchOptions = Object.assign(
      {
        chromeFlags,
        logLevel: 'silent',
      },
      options
    );
    debug(
      `Launching chrome with flags "${launchOptions.chromeFlags.join(' ')}"`
    );
    instance = await chromeLauncher.launch(launchOptions);
  }

  async function stop() {
    if (instance) {
      debug('Killing chrome');
      await instance.kill();
    } else {
      debug('No chrome instance to kill');
    }

    if (staticServer) {
      staticServer.close();
    }
  }

  async function createNewDebuggerInstance() {
    const { port } = instance;
    debug(`Launching new tab with debugger at port ${port}`);
    const target = await CDP.New({ port });
    debug(`Launched with target id ${target.id}`);
    const client = await CDP({ port, target });

    client.close = () => {
      debug('Closing tab');
      return CDP.Close({ port, id: target.id });
    };

    return client;
  }

  return createChromeTarget(start, stop, createNewDebuggerInstance, chromeUrl);
}

module.exports = createChromeAppTarget;
