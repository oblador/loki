const { createChromeAWSLambdaRenderer } = require('@loki/renderer-aws-lambda');

module.exports = {
  handler: createChromeAWSLambdaRenderer(),
};
