const fs = require('fs-extra');
const tempy = require('tempy');
const osnap = require('osnap/src/android');
const { createWebsocketTarget } = require('@loki/target-native-core');

const captureScreenshot = async () => {
  const filename = tempy.file({ extension: 'png' });
  await osnap.saveToFile({ filename });
  const screenshot = await fs.readFile(filename);
  await fs.unlink(filename);
  return screenshot;
};

const createAndroidEmulatorTarget = (socketUri) =>
  createWebsocketTarget(socketUri, 'android', captureScreenshot);

module.exports = createAndroidEmulatorTarget;
