const osnap = require('osnap/src/android');
const createWebsocketTarget = require('./create-websocket-target');

const saveScreenshotToFile = filename => osnap.saveToFile({ filename });

const createAndroidEmulatorTarget = socketUri =>
  createWebsocketTarget(socketUri, 'android', saveScreenshotToFile);

module.exports = createAndroidEmulatorTarget;
