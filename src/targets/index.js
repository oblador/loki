const {
  createChromeAppTarget,
  createChromeDockerTarget,
  createChromeDockerExtTarget
} = require('./chrome');
const {
  createIOSSimulatorTarget,
  createAndroidEmulatorTarget,
} = require('./native');

module.exports = {
  createChromeAppTarget,
  createChromeDockerTarget,
  createChromeDockerExtTarget,
  createIOSSimulatorTarget,
  createAndroidEmulatorTarget,
};
