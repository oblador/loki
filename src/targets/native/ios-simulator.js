const createWebsocketTarget = require('./create-websocket-target');
const osnap = require('osnap/src/ios');

const saveScreenshotToFile = filename => osnap.saveToFile({ filename });

const createIOSSimulatorTarget = socketUri =>
  createWebsocketTarget(socketUri, 'ios', saveScreenshotToFile);

module.exports = createIOSSimulatorTarget;
