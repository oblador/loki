const chromium = require('chrome-aws-lambda');
const { createChromeAppTarget } = require('@loki/target-chrome-app');

const withTarget = fn => async (event, context, callback) => {
  const target = createChromeAppTarget({
    baseUrl: event.baseUrl,
  });
  try {
    await target.start({
      chromeFlags: chromium.args,
      chromePath: await chromium.executablePath,
    });
    const result = await fn(target, event, context);
    callback(null, result);
  } catch (error) {
    callback(error);
  } finally {
    await target.stop();
  }
};

module.exports = function createChromeAWSLambdaRenderer() {
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

  return {
    getStorybook: withTarget(getStorybook),
    captureScreenshotForStory: withTarget(captureScreenshotForStory),
  };
};
