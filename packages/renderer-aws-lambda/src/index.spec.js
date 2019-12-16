const mod = require('./index');

describe('renderer-aws-lambda', () => {
  it('exports an object with createChromeAWSLambdaRenderer', () => {
    expect(mod).toEqual({
      createChromeAWSLambdaRenderer: expect.any(Function),
    });
  });
});
