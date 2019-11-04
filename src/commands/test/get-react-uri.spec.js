const getReactUri = require('./get-react-uri');

describe('getReactUri', () => {
  const host = '127.0.0.1';
  const port = 6006;

  it('returns absolute file: URLs untouched', () => {
    const absoluteFileUrl = `file:${__filename}`;
    expect(getReactUri(absoluteFileUrl, host, port, false)).toBe(
      absoluteFileUrl
    );
  });

  it('returns relative file: URLs resolved to absolute path', () => {
    const relativeFileUrl = `file:${__filename.replace(process.cwd(), '.')}`;
    const absoluteFileUrl = `file:${__filename}`;
    expect(relativeFileUrl).not.toBe(absoluteFileUrl);
    expect(getReactUri(relativeFileUrl, host, port, false)).toBe(
      absoluteFileUrl
    );
  });

  it('returns relative file: URLs untouched', () => {
    const relativeFileUrl = `file:./storybook`;
    expect(getReactUri(relativeFileUrl, host, port, true)).toBe(
      relativeFileUrl
    );
  });

  it('returns http: URLs untouched', () => {
    const reactUri = undefined;
    const hostUrl = `http://${host}:${port}`;
    expect(getReactUri(reactUri, host, port, true)).toBe(hostUrl);
  });
});
