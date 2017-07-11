const { createWriteStream } = require('fs');
const osnap = require('osnap/src/android');
const execa = require('execa');
const createWebsocketTarget = require('./create-websocket-target');

// Temporary workaround until this is merged:
// https://github.com/skellock/osnap/pull/6
const saveScreenshotToFile = async filename => {
  const adb = osnap.getAdbPath();
  const device = await osnap.checkEmulator(adb);
  return new Promise((resolve, reject) => {
    try {
      // up the max buffer size since these could be huge iamges
      const maxBuffer = 1024 * 1000 * 50; // 50 MB

      // create the processes needed in the chain
      const adbProcess = execa(
        adb,
        ['-s', device, 'exec-out', 'screencap', '-p'],
        { maxBuffer }
      );
      adbProcess.stdout.pipe(createWriteStream(filename));

      // determine when we've ended
      adbProcess.on('exit', exitCode => {
        if (exitCode === 0) {
          resolve();
        } else {
          reject();
        }
      });
    } catch (err) {
      throw new Error('Some horrible happened while taking a screenshot.');
    }
  });
};

const createAndroidEmulatorTarget = socketUri =>
  createWebsocketTarget(socketUri, 'android', saveScreenshotToFile);

module.exports = createAndroidEmulatorTarget;
