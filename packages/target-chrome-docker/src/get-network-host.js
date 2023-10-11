const fs = require('fs-extra');

const getNetworkHost = async (execute, dockerId) => {
  let host = '127.0.0.1';

  // https://stackoverflow.com/questions/68816329/how-to-get-docker-container-id-from-within-the-container-with-cgroup-v2
  const runningInsideDocker =
    fs.existsSync('/proc/self/mountinfo') &&
    /\/docker\/containers\//.test(fs.readFileSync('/proc/self/mountinfo', 'utf8'));

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
