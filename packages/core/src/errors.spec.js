const { ChromeError, serializeError, parseError } = require('./errors');

describe('ChromeError', () => {
  it('is an instance of Error', () => {
    expect(new ChromeError('lol')).toBeInstanceOf(Error);
  });
});

describe('serializeError', () => {
  it('serializes unknown error types as Error', () => {
    expect(serializeError(new Error('lol'))).toMatchInlineSnapshot(
      `"{\\"isSerializedError\\":true,\\"type\\":\\"Error\\",\\"args\\":[\\"lol\\"]}"`
    );
  });

  it('serializes ChromeError types with preserved arguments', () => {
    expect(
      serializeError(new ChromeError('lol', 'dont do that'))
    ).toMatchInlineSnapshot(
      `"{\\"isSerializedError\\":true,\\"type\\":\\"ChromeError\\",\\"args\\":[\\"lol\\",\\"dont do that\\"]}"`
    );
  });
});

describe('parseError', () => {
  it('parses stringified generic Error', () => {
    const error = parseError(serializeError(new Error('lol')));
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('lol');
  });

  it('parses Error.toString()', () => {
    const error = parseError(new Error('lol').toString());
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('lol');
  });

  it('parses stringified ChromeError', () => {
    const originalError = new ChromeError('lol', 'dont do that');
    const error = parseError(serializeError(originalError));
    expect(error).toBeInstanceOf(ChromeError);
    expect(error.message).toBe(originalError.message);
    expect(error.name).toBe(originalError.name);
    expect(error.instructions).toBe(originalError.instructions);
  });

  it('returns non string errors without parsing', () => {
    expect(parseError(null)).toEqual(null);
    expect(parseError({})).toEqual({});
  });
});
