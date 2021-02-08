const { withRetries } = require('./failure-handling');

describe('withRetries', () => {
  it('returns a function', () => {
    expect(withRetries(1)(() => {})).toEqual(expect.any(Function));
  });

  it('calls the original function', () => {
    const mockFn = jest.fn(() => 'output');
    const retriedMockFn = withRetries(1)(mockFn);
    const output = retriedMockFn('input');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('input');
    return expect(output).resolves.toBe('output');
  });

  it('calls the original function 4 times if passing 3 retries', () => {
    const mockFn = jest.fn(() => {
      throw new Error('output');
    });
    const retriedMockFn = withRetries(3)(mockFn);
    const output = retriedMockFn('input');
    expect(mockFn).toHaveBeenCalledTimes(4);
    return expect(output).rejects.toThrow('Failed with "output"');
  });

  it('pauses between each attempt when passing backoff argument', async () => {
    const retries = 3;
    jest.useFakeTimers();
    const callback = jest.fn();
    const mockFn = jest.fn(() => {
      throw new Error('output');
    });
    const retriedMockFn = withRetries(retries, 100)(mockFn);
    const output = retriedMockFn('input');
    output.catch(callback);
    for (let i = 0; i < retries; i++) {
      expect(callback).toHaveBeenCalledTimes(0);
      jest.runAllTimers();
      await new Promise((resolve) => setImmediate(resolve));
    }
    await expect(output).rejects.toThrow('Failed with "output"');
    expect(mockFn).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
