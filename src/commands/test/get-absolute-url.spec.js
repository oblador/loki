const getAbsoluteURL = require('./get-absolute-url');

describe('getAbsoluteURL', () => {
  it('returns absolute file: URLs untouched', () => {
    const absoluteFileUrl = `file:${__filename}`;
    expect(getAbsoluteURL(absoluteFileUrl)).toBe(absoluteFileUrl);
  });

  it('returns relative file: URLs resolved to absolute path', () => {
    const relativeFileUrl = `file:${__filename.replace(process.cwd(), '.')}`;
    const absoluteFileUrl = `file:${__filename}`;
    expect(relativeFileUrl).not.toBe(absoluteFileUrl);
    expect(getAbsoluteURL(relativeFileUrl)).toBe(absoluteFileUrl);
  });

  it('returns http: URLs untouched', () => {
    const url = `http://loki.js.org`;
    expect(getAbsoluteURL(url)).toBe(url);
  });

  it('returns https: URLs untouched', () => {
    const url = `https://loki.js.org`;
    expect(getAbsoluteURL(url)).toBe(url);
  });
});
