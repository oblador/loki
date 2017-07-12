const fs = require('fs-extra');
const osnap = require('osnap/src/ios');
const { withRetries } = require('../../failure-handling');
const createWebsocketTarget = require('./create-websocket-target');

const saveScreenshotToFile = withRetries(3)(async filename => {
  await osnap.saveToFile({ filename });
  const { size } = await fs.stat(filename);
  if (size === 0) {
    throw new Error('Screenshot failed ');
  }
});

const createIOSSimulatorTarget = socketUri =>
  createWebsocketTarget(socketUri, 'ios', saveScreenshotToFile);

module.exports = createIOSSimulatorTarget;
