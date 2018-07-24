const debug = require('debug')('loki:chrome:docker');
const os = require('os');
const { execSync } = require('child_process');
const execa = require('execa');
const waitOn = require('wait-on');
const CDP = require('chrome-remote-interface');
const fs = require('fs-extra');
const getRandomPort = require('get-port');
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

// https://tuhrig.de/how-to-know-you-are-inside-a-docker-container/
const getCurrentDockerId = () => {
  const PROCESS_CONTROL_GROUP_PATH = '/proc/1/cgroup';
  if (fs.existsSync(PROCESS_CONTROL_GROUP_PATH)) {
    const cgroup = fs.readFileSync(PROCESS_CONTROL_GROUP_PATH, 'utf8');
    const currentDockerIdMatch = /^\d+:cpu.+\/([^/]+)$/m.exec(cgroup);
    if (currentDockerIdMatch) {
      console.log('getCurrentDockerId', currentDockerIdMatch[1]);
      return currentDockerIdMatch[1];
    }
  }
  return null;
};

const getDockerContainerIPAddress = async dockerId => {
  const { code, stdout } = await execa('docker', [
    'inspect',
    '-f {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',
    dockerId,
  ]);

  if (code !== 0) {
    throw new Error('Unable to determine IP of docker container');
  }
  console.log('getDockerContainerIPAddress', stdout);

  return stdout;
};

const isSiblingDockerContainer = async dockerId => {
  // If the current docker container is not running in the current docker host,
  // then we are running in docker-in-docker mode and docker containers we spawn are
  // children of our docker container, and not siblings (running on the same host as us)
  try {
    const { code } = await execa('docker', ['inspect', dockerId]);
    console.log('sibling docker container');
    return code === 0;
  } catch (error) {
    return false;
  }
};

const getDockerHostname = async () => {
  const { stdout } = await execa('docker', ['info', '-f', '{{json .Name}}']);
  return JSON.parse(stdout);
};

const getHostExist = async hostname => {
  try {
    await execa('ping', ['-q', '-c 1', '-t 1', hostname]);
    return true;
  } catch (error) {
    return false;
  }
};

const getNetworkHost = async dockerId => {
  const currentDockerId = getCurrentDockerId();
  console.log({currentDockerId});

  if (currentDockerId) {
    if (await isSiblingDockerContainer(currentDockerId)) {
      // If we are running inside a docker container, our spawned docker chrome instance
      // will be a sibling on the default bridge, which means we can talk directly to it
      // via its IP address.
      console.log('sibling');
      return getDockerContainerIPAddress(dockerId);
    }

    console.log('not sibling');
    const dockerHostname = await getDockerHostname();
    if (await getHostExist(dockerHostname)) {
      return dockerHostname;
    }
  }

  return '127.0.0.1';
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

function createChromeDockerTarget({
                                    baseUrl = 'http://localhost:6006',
                                    chromeDockerImage = 'yukinying/chrome-headless',
                                    chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
                                  }) {
  let port;
  let dockerId;
  let host;
  let dockerUrl = baseUrl;
  const dockerPath = 'docker';
  const runArgs = ['run', '--rm', '-d', '-P'];

  if (!process.env.CI) {
    runArgs.push(`--security-opt=seccomp=${__dirname}/docker-seccomp.json`);
  }

  if (baseUrl.indexOf('http://localhost') === 0) {
    const ip = getLocalIPAddress();
    if (!ip) {
      throw new Error(
        'Unable to detect local IP address, try passing --host argument'
      );
    }
    dockerUrl = baseUrl.replace('localhost', ip);
  } else if (baseUrl.indexOf('file:') === 0) {
    const staticPath = baseUrl.substr('file:'.length);
    const staticMountPath = '/var/loki';
    runArgs.push('-v');
    runArgs.push(`${staticPath}:${staticMountPath}`);
    dockerUrl = `file://${staticMountPath}`;
  }

  async function getIsImageDownloaded(imageName) {
    const { code, stdout, stderr } = await execa(dockerPath, [
      'images',
      '-q',
      imageName,
    ]);
    if (code !== 0) {
      throw new Error(`Failed querying docker, ${stderr}`);
    }
    return stdout.trim().length !== 0;
  }

  async function ensureImageDownloaded() {
    ensureDependencyAvailable('docker');

    const isImageDownloaded = await getIsImageDownloaded(chromeDockerImage);
    if (!isImageDownloaded) {
      await execa(dockerPath, ['pull', chromeDockerImage]);
    }
  }

  async function start() {
    port = await getRandomPort();

    ensureDependencyAvailable('docker');
    const args = runArgs
      .concat([
        '--shm-size=1g',
        '-p',
        `${port}:${port}`,
        chromeDockerImage,
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
    const { code, stdout, stderr } = await execa(dockerPath, args);
    if (code === 0) {
      dockerId = stdout;
      host = await getNetworkHost(dockerId);
      try {
        await waitOnCDPAvailable(host, port);
      } catch (error) {
        throw new Error(
          `Timed out waiting for Chrome Debugger to appear on ${host}:${port}`
        );
      }
      debug(`Docker started with id ${dockerId}`);
    } else {
      throw new Error(`Failed starting docker, ${stderr}`);
    }
  }

  async function stop() {
    if (dockerId) {
      debug(`Killing chrome docker instance with id ${dockerId}`);
      await execa(dockerPath, ['kill', dockerId]);
    } else {
      debug('No chrome docker instance to kill');
    }
  }

  async function createNewDebuggerInstance() {
    debug(`Launching new tab with debugger at ${host}:${port}`);
    const target = await CDP.New({ host, port });
    debug(`Launched with target id ${target.id}`);
    const client = await CDP({ host, port, target });

    client.close = () => {
      debug('New closing tab');
      return CDP.Close({ host, port, id: target.id });
    };

    return client;
  }

  process.on('SIGINT', () => {
    if (dockerId) {
      execSync(`${dockerPath} kill ${dockerId}`);
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

module.exports = createChromeDockerTarget;
