const debug = require('debug')('loki:chrome:aws-lambda');
const AWS = require('aws-sdk');
const { parseError } = require('@loki/core');

function createChromeAWSLambdaTarget({
  baseUrl = 'http://localhost:6006',
  chromeAwsLambdaFunctionName,
}) {
  const invoke = async payload => {
    const lambda = new AWS.Lambda();

    const params = {
      FunctionName: chromeAwsLambdaFunctionName,
      Payload: JSON.stringify(payload),
    };

    debug(`Invoking ${params.FunctionName} with ${params.Payload}`);
    const data = await lambda.invoke(params).promise();
    const response = JSON.parse(data.Payload);
    if (response.errorMessage) {
      throw parseError(response.errorMessage);
    }
    return response;
  };

  const start = () => {};
  const stop = () => {};

  const getStorybook = () =>
    invoke({
      command: 'getStorybook',
      baseUrl,
    });

  const captureScreenshotForStory = async (
    kind,
    story,
    options,
    configuration
  ) => {
    const screenshot = await invoke({
      command: 'captureScreenshotForStory',
      baseUrl,
      kind,
      story,
      options,
      configuration,
    });
    return Buffer.from(screenshot, 'base64');
  };

  return {
    start,
    stop,
    getStorybook,
    captureScreenshotForStory,
  };
}

module.exports = createChromeAWSLambdaTarget;
