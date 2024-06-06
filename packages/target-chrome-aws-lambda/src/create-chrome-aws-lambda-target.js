const debug = require('debug')('loki:chrome:aws-lambda');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const { parseError, withRetries } = require('@loki/core');

function createChromeAWSLambdaTarget({
  baseUrl = 'http://localhost:6006',
  chromeAwsLambdaFunctionName,
  chromeAwsLambdaRetries = 0,
}) {
  const invoke = withRetries(
    chromeAwsLambdaRetries,
    1000
  )(async (payload) => {
    const lambdaClient = new LambdaClient();

    const params = {
      FunctionName: chromeAwsLambdaFunctionName,
      Payload: JSON.stringify(payload),
    };

    debug(`Invoking ${params.FunctionName} with ${params.Payload}`);
    const command = new InvokeCommand(params);

    const data = await lambdaClient.invoke(command);
    const response = JSON.parse(data.Payload);
    if (response.errorMessage) {
      debug(
        `Invocation failed due to ${response.errorType} with message "${response.errorMessage}"`
      );
      throw parseError(response.errorMessage);
    }
    return response;
  });

  const start = () => {};
  const stop = () => {};

  const getStorybook = () =>
    invoke({
      command: 'getStorybook',
      baseUrl,
    });

  const captureScreenshotForStory = async (
    id,
    options,
    configuration,
    parameters
  ) => {
    const screenshot = await invoke({
      command: 'captureScreenshotForStory',
      baseUrl,
      id,
      options,
      configuration,
      parameters,
    });
    return Buffer.from(screenshot, 'base64');
  };

  const captureScreenshotsForStories = async (stories, options) => {
    const screenshots = await invoke({
      command: 'captureScreenshotsForStories',
      baseUrl,
      stories,
      options,
    });
    return screenshots.map((screenshot) => {
      if (screenshot.errorMessage) {
        return parseError(screenshot.errorMessage);
      }
      return new Uint8Array(Buffer.from(screenshot, 'base64'));
    });
  };

  return {
    start,
    stop,
    getStorybook,
    captureScreenshotForStory,
    captureScreenshotsForStories,
  };
}

module.exports = createChromeAWSLambdaTarget;
