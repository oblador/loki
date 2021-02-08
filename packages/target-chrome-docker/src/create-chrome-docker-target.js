const debug = require('debug')('loki:chrome:docker');
const { execSync } = require('child_process');
const execa = require('execa');
const waitOn = require('wait-on');
const CDP = require('chrome-remote-interface');
const getRandomPort = require('get-port');
const {
  ChromeError,
  ensureDependencyAvailable,
  getAbsoluteURL,
} = require('@loki/core');
const { createChromeTarget } = require('@loki/target-chrome-core');
const { getLocalIPAddress } = require('./get-local-ip-address');
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
  chromeDockerImage = 'yukinying/chrome-headless-browser',
  chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
  dockerNet = null,
  dockerWithSudo = false,
  chromeDockerUseCopy = false,
  chromeDockerWithoutSeccomp = false,
}) {
  let port;
  let dockerId;
  let host;
  let localPath;
  let dockerUrl = getAbsoluteURL(baseUrl);
  const isLocalFile = dockerUrl.indexOf('file:') === 0;
  const staticMountPath = '/var/loki';
  const dockerPath = 'docker';
  const runArgs = ['run', '--rm', '-d', '-P'];
  const execute = getExecutor(dockerWithSudo);

  if (!chromeDockerWithoutSeccomp) {
    runArgs.push(`--security-opt=seccomp=${__dirname}/docker-seccomp.json`);
  }

  if (dockerUrl.indexOf('http://localhost') === 0) {
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }
    dockerUrl = dockerUrl.replace('localhost', ip);
  } else if (isLocalFile) {
    localPath = dockerUrl.substr('file:'.length);
    dockerUrl = `file://${staticMountPath}`;
    if (!chromeDockerUseCopy) {
      // setup volume mount if we're not using copy
      runArgs.push('-v');
      runArgs.push(`${localPath}:${staticMountPath}`);
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

  async function copyFiles() {
    const { exitCode, stdout, stderr } = await execute(dockerPath, [
      'cp',
      localPath,
      `${dockerId}:${staticMountPath}`,
    ]);

    if (exitCode !== 0) {
      throw new Error(`Failed to copy files, ${stderr}`);
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
    port = await getRandomPort();

    ensureDependencyAvailable('docker');
    const dockerArgs = runArgs.concat([
      '--shm-size=1g',
      '-p',
      `${port}:${port}`,
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
        `--remote-debugging-port=${port}`,
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
      if (chromeDockerUseCopy) {
        await copyFiles();
      }
      const logs = execute(dockerPath, ['logs', dockerId, '--follow']);
      const errorLogs = [];
      logs.stderr.on('data', (chunk) => {
        errorLogs.push(chunk);
      });

      host = await getNetworkHost(execute, dockerId);
      try {
        await waitOnCDPAvailable(host, port);
      } catch (error) {
        if (error.message === 'Timeout' && errorLogs.length !== 0) {
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
      await execute(dockerPath, ['kill', dockerId]);
    } else {
      debug('No chrome docker instance to kill');
    }
  }

  async function createNewDebuggerInstance() {
    debug(`Launching new tab with debugger at port ${host}:${port}`);
    const target = await CDP.New({ host, port });
    debug(`Launched with target id ${target.id}`);
    const client = await CDP({ host, port, target });

    client.close = () => {
      debug('Closing tab');
      return CDP.Close({ host, port, id: target.id });
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
