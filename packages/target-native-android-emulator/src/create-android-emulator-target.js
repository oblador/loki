const fs = require('fs-extra');
const tempy = require('tempy');
const osnap = require('@ferocia-oss/osnap/src/android');
const { createWebsocketTarget } = require('@loki/target-native-core');

const captureScreenshot = async (device) => {
  const filename = tempy.file({ extension: 'png' });
  await osnap.saveToFile({ filename, device });
  const screenshot = await fs.readFile(filename);
  await fs.unlink(filename);
  return screenshot;
};

const createAndroidEmulatorTarget = ({ socketUri, device }) =>
  createWebsocketTarget(socketUri, 'android', () => captureScreenshot(device));

module.exports = createAndroidEmulatorTarget;
