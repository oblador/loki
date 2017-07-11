const { createChromeAppTarget, createChromeDockerTarget } = require('./chrome');
const {
  createIOSSimulatorTarget,
  createAndroidEmulatorTarget,
} = require('./native');

module.exports = {
  createChromeAppTarget,
  createChromeDockerTarget,
  createIOSSimulatorTarget,
  createAndroidEmulatorTarget,
};
