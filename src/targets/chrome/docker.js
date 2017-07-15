const debug = require('debug')('loki:chrome:docker');
const os = require('os');
const execa = require('execa');
const waitOn = require('wait-on');
const CDP = require('chrome-remote-interface');
const { getRandomPort } = require('lighthouse/chrome-launcher/random-port');
const { ensureDependencyAvailable } = require('../../dependency-detection');
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

const waitOnCDPAvailable = port =>
  new Promise((resolve, reject) => {
    waitOn(
      {
        resources: [`tcp:localhost:${port}`],
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

function createChromeDockerTarget({
  baseUrl = 'http://localhost:6006',
  chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
}) {
  let port;
  let dockerId;

  async function start() {
    port = await getRandomPort();

    ensureDependencyAvailable('docker');
    const dockerPath = 'docker';
    const args = [
      'run',
      '--rm',
      '-d',
      '--security-opt',
      `seccomp=${__dirname}/docker-seccomp.json`,
      '-P',
      '-p',
      `${port}:${port}`,
      'armbues/chrome-headless',
      '--disable-datasaver-prompt',
      '--no-first-run',
      '--disable-extensions',
      '--remote-debugging-address=0.0.0.0',
      `--remote-debugging-port=${port}`,
    ].concat(chromeFlags);

    debug(
      `Launching chrome in docker with command "${dockerPath} ${args.join(
        ' '
      )}"`
    );
    const { code, stdout, stderr } = await execa(dockerPath, args);
    if (code === 0) {
      await waitOnCDPAvailable(port);
      dockerId = stdout;
      debug(`Docker started with id ${dockerId}`);
    } else {
      throw new Error(`Failed starting docker, ${stderr}`);
    }
  }

  async function stop() {
    if (dockerId) {
      debug(`Killing chrome docker instance with id ${dockerId}`);
      await execa('docker', ['stop', dockerId]);
    } else {
      debug('No chrome docker instance to kill');
    }
  }

  async function createNewDebuggerInstance() {
    debug(`Launching new tab with debugger at port ${port}`);
    const target = await CDP.New({ port });
    debug(`Launched with target id ${target.id}`);
    const client = await CDP({ port, target });

    client.close = () => {
      debug('New closing tab');
      return CDP.Close({ port, id: target.id });
    };

    return client;
  }

  let url = baseUrl;
  if (url.indexOf('http://localhost') === 0) {
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }
    url = url.replace('localhost', ip);
  }

  return createChromeTarget(start, stop, createNewDebuggerInstance, url);
}

module.exports = createChromeDockerTarget;
