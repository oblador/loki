const chromium = require('chrome-aws-lambda');
const { createChromeAppTarget } = require('@loki/target-chrome-app');

const getStorybook = async target => {
  const stories = await target.getStorybook();
  return stories;
};

const captureScreenshotForStory = async (target, event) => {
  const screenshot = await target.captureScreenshotForStory(
    event.kind,
    event.story,
    event.options || {},
    event.configuration || {}
  );
  return screenshot.toString('base64');
};

const commands = {
  getStorybook,
  captureScreenshotForStory,
};

const createChromeAWSLambdaRenderer = () => async event => {
  const command = commands[event.command];
  if (!command) {
    throw new Error(`Unknown command "${event.command}"`);
  }
  const target = createChromeAppTarget({
    baseUrl: event.baseUrl,
  });
  try {
    await target.start({
      chromeFlags: chromium.args,
      chromePath: await chromium.executablePath,
    });
    return await command(target, event);
  } finally {
    await target.stop();
  }
};

module.exports = createChromeAWSLambdaRenderer;
