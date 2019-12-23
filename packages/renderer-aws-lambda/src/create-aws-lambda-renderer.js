const chromium = require('chrome-aws-lambda');
const mapLimit = require('async/mapLimit');
const { createChromeAppTarget } = require('@loki/target-chrome-app');
const { serializeError, unwrapError } = require('@loki/core');

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

const captureScreenshotsForStories = async (target, event) => {
  const concurrency =
    (event.options && event.options.chromeAwsLambdaBatchConcurrency) || 1;
  return mapLimit(event.stories, concurrency, async task => {
    try {
      const screenshot = await captureScreenshotForStory(target, {
        kind: task.kind,
        story: task.story,
        configuration: task.configuration,
        options: event.options,
      });
      return screenshot;
    } catch (error) {
      return { errorMessage: serializeError(unwrapError(error)) };
    }
  });
};

const commands = {
  getStorybook,
  captureScreenshotForStory,
  captureScreenshotsForStories,
};

const createChromeAWSLambdaRenderer = () => async event => {
  const command = commands[event.command];
  if (!command) {
    throw serializeError(new Error(`Unknown command "${event.command}"`));
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
  } catch (error) {
    throw serializeError(unwrapError(error));
  } finally {
    await target.stop();
  }
};

module.exports = createChromeAWSLambdaRenderer;
