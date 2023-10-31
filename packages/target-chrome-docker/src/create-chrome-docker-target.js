const debug = require('debug')('loki:chrome:docker');
const { execSync } = require('child_process');
const execa = require('execa');
const waitOn = require('wait-on');
const CDP = require('chrome-remote-interface');
const getRandomPort = require('find-free-port-sync');
const {
  ChromeError,
  ensureDependencyAvailable,
  getAbsoluteURL,
  getLocalIPAddress,
  createStaticServer,
} = require('@loki/core');
const { createChromeTarget } = require('@loki/target-chrome-core');
const { getNetworkHost } = require('./get-network-host');

const getExecutor = (dockerWithSudo) => (dockerPath, args) => {
  if (dockerWithSudo) {
    return execa('sudo', [dockerPath, ...args]);
  }

  return execa(dockerPath, args);
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
      (err) => {
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
  chromeDockerImage = 'yukinying/chrome-headless-browser-stable:100.0.4896.127',
  chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
  dockerNet = null,
  dockerWithSudo = false,
  chromeDockerWithoutSeccomp = false,
}) {
  let debuggerPort;
  let staticServer;
  let staticServerPath;
  let staticServerPort;
  let dockerId;
  let host;
  let dockerUrl = getAbsoluteURL(baseUrl);
  const isLocalFile = dockerUrl.indexOf('file:') === 0;
  const dockerPath = 'docker';
  const runArgs = ['run', '--rm', '-d', '-P'];
  const execute = getExecutor(dockerWithSudo);

  if (!chromeDockerWithoutSeccomp) {
    runArgs.push(`--security-opt=seccomp=${__dirname}/docker-seccomp.json`);
  }
  runArgs.push('--add-host=host.docker.internal:host-gateway');

  if (dockerUrl.indexOf('http://localhost') === 0 || isLocalFile) {
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }
    if (isLocalFile) {
      staticServerPort = getRandomPort();
      staticServerPath = dockerUrl.substr('file:'.length);
      dockerUrl = `http://${ip}:${staticServerPort}`;
    } else {
      dockerUrl = dockerUrl.replace('localhost', ip);
    }
  }

  async function getIsImageDownloaded(imageName) {
    const { exitCode, stdout, stderr } = await execute(dockerPath, [
      'images',
      '-q',
      imageName,
    ]);

    if (exitCode !== 0) {
      throw new Error(`Failed querying docker, ${stderr}`);
    }
    return stdout.trim().length !== 0;
  }

  async function ensureImageDownloaded() {
    ensureDependencyAvailable('docker');

    const isImageDownloaded = await getIsImageDownloaded(chromeDockerImage);
    if (!isImageDownloaded) {
      await execute(dockerPath, ['pull', chromeDockerImage]);
    }
  }

  async function start() {
    ensureDependencyAvailable('docker');

    debuggerPort = getRandomPort();
    if (isLocalFile) {
      staticServer = createStaticServer(staticServerPath);
      staticServer.listen(staticServerPort);
      debug(`Starting static file server at ${dockerUrl}`);
    }

    const dockerArgs = runArgs.concat([
      '--shm-size=1g',
      '-p',
      `${debuggerPort}:${debuggerPort}`,
    ]);

    if (dockerNet) {
      dockerArgs.push(`--net=${dockerNet}`);
    }
    dockerArgs.push(chromeDockerImage);

    const args = dockerArgs
      .concat([
        '--disable-datasaver-prompt',
        '--no-first-run',
        '--disable-extensions',
        '--remote-debugging-address=0.0.0.0',
        `--remote-debugging-port=${debuggerPort}`,
      ])
      .concat(chromeFlags);

    debug(
      `Launching chrome in docker with command "${dockerPath} ${args.join(
        ' '
      )}"`
    );
    const { exitCode, stdout, stderr } = await execute(dockerPath, args);
    if (exitCode === 0) {
      dockerId = stdout;
      const logs = execute(dockerPath, ['logs', dockerId, '--follow']);
      const errorLogs = [];
      logs.stderr.on('data', (chunk) => {
        errorLogs.push(chunk);
      });

      host = await getNetworkHost(execute, dockerId);
      try {
        await waitOnCDPAvailable(host, debuggerPort);
      } catch (error) {
        if (
          error.message.startsWith('Timed out waiting for') &&
          errorLogs.length !== 0
        ) {
          throw new ChromeError(
            `Chrome failed to start with ${
              errorLogs.length === 1 ? 'error' : 'errors'
            } ${errorLogs
              .map((e) => `"${e.toString('utf8').trim()}"`)
              .join(', ')}`
          );
        }
        throw error;
      } finally {
        if (logs.exitCode === null && !logs.killed) {
          logs.kill();
        }
      }
      debug(`Docker started with id ${dockerId}`);
    } else {
      throw new Error(`Failed starting docker, ${stderr}`);
    }
  }

  async function stop() {
    if (dockerId) {
      debug(`Killing chrome docker instance with id ${dockerId}`);
      try {
        await execute(dockerPath, ['kill', dockerId]);
      } catch (e) {
        if (e.toString().indexOf('No such container') === -1) {
          throw e;
        }
      }
    } else {
      debug('No chrome docker instance to kill');
    }
    if (staticServer) {
      staticServer.close();
    }
  }

  async function createNewDebuggerInstance() {
    debug(`Launching new tab with debugger at port ${host}:${debuggerPort}`);
    const target = await CDP.New({ host, port: debuggerPort });
    debug(`Launched with target id ${target.id}`);
    const client = await CDP({ host, port: debuggerPort, target });

    client.close = () => {
      debug('Closing tab');
      return CDP.Close({ host, port: debuggerPort, id: target.id });
    };

    return client;
  }

  process.on('SIGINT', () => {
    if (dockerId) {
      const maybeSudo = dockerWithSudo ? 'sudo ' : '';
      execSync(`${maybeSudo}${dockerPath} kill ${dockerId}`);
    }
  });

  return createChromeTarget(
    start,
    stop,
    createNewDebuggerInstance,
    dockerUrl,
    ensureImageDownloaded
  );
}

module.exports = { createChromeDockerTarget };
