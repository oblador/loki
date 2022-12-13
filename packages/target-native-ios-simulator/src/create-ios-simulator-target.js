const fs = require('fs-extra');
const tempy = require('tempy');
const osnap = require('osnap/src/ios');
const { withRetries } = require('@loki/core');
const { createWebsocketTarget } = require('@loki/target-native-core');

const captureScreenshot = withRetries(3)(async (device) => {
  const filename = tempy.file({ extension: 'png' });
  await osnap.saveToFile({ filename, device });
  const { size } = await fs.stat(filename);
  if (size === 0) {
    throw new Error('Screenshot failed ');
  }
  const screenshot = await fs.readFile(filename);
  await fs.unlink(filename);
  return screenshot;
});

const createIOSSimulatorTarget = ({ socketUri, device }) =>
  createWebsocketTarget(socketUri, 'ios', () => captureScreenshot(device));

module.exports = createIOSSimulatorTarget;
