const debug = require('debug')('loki:chrome:app');
const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const { createChromeTarget } = require('@loki/target-chrome-core');

function createChromeAppTarget({
  baseUrl = 'http://localhost:6006',
  chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
}) {
  let instance;

  async function start(options = {}) {
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

  return createChromeTarget(start, stop, createNewDebuggerInstance, baseUrl);
}

module.exports = createChromeAppTarget;
