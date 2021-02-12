const fs = require('fs-extra');

const getNetworkHost = async (execute, dockerId) => {
  let host = '127.0.0.1';

  // https://tuhrig.de/how-to-know-you-are-inside-a-docker-container/
  const runningInsideDocker =
    fs.existsSync('/proc/1/cgroup') &&
    /docker/.test(fs.readFileSync('/proc/1/cgroup', 'utf8'));

  // If we are running inside a docker container, our spawned docker chrome instance will be a sibling on the default
  // bridge, which means we can talk directly to it via its IP address.
  if (runningInsideDocker) {
    const { exitCode, stdout } = await execute('docker', [
      'inspect',
      '-f',
      '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}',
      dockerId,
    ]);

    if (exitCode !== 0) {
      throw new Error('Unable to determine IP of docker container');
    }

    host = stdout;
  }

  return host;
};

module.exports = { getNetworkHost };
