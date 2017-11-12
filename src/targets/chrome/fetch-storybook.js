const cluster = require('cluster');
const path = require('path');
const { ServerError } = require('../../errors');

function createError({ message, name, instructions }) {
  switch (name) {
    case 'ServerError':
      return new ServerError(message, instructions);
    default:
      return new Error(message);
  }
}

// Wrap this functionality in a killable sub process to be
// able to avoid the main process waiting for storybook timers
// running in the vm.
function fetchStorybook(baseUrl = 'http://localhost:6006') {
  return new Promise((resolve, reject) => {
    cluster.setupMaster({
      exec: path.join(__dirname, 'fetch-storybook-worker.js'),
      silent: false,
    });

    const worker = cluster.fork();

    worker.on('online', () => {
      worker.send(baseUrl);
    });

    worker.on('message', message => {
      const { error, storybook } = JSON.parse(message);
      if (error) {
        reject(createError(error));
      } else {
        resolve(storybook);
      }
      worker.kill();
    });

    worker.on('error', error => {
      reject(error);
      worker.kill();
    });

    worker.on('exit', code => {
      reject(new Error(`Fetch storybook Worker exited with code ${code}`));
    });
  });
}

module.exports = fetchStorybook;
