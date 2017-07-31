const mockHttp = {
  get: jest.fn(() => ({ on: jest.fn() })),
};
jest.mock('http', () => mockHttp);
const mockFs = {
  readFile: jest.fn(),
};
jest.mock('fs', () => mockFs);

const path = require('path');
const fetchUrl = require('./fetch-url');

describe('fetchUrl', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a promise', () => {
    expect(fetchUrl('http://loki.js.org')).toBeInstanceOf(Promise);
  });

  it('calls http.get for http: URIs', () => {
    fetchUrl('http://loki.js.org');
    expect(mockHttp.get).toHaveBeenCalledTimes(1);
    expect(mockHttp.get.mock.calls[0][0]).toEqual({
      agent: false,
      hostname: 'loki.js.org',
      path: '/',
      port: 80,
      protocol: 'http:',
    });
  });

  it('calls fs.readFile for file: URIs', () => {
    fetchUrl('file:./filename.js');
    expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    expect(mockFs.readFile.mock.calls[0][0]).toEqual(
      path.resolve('./filename.js')
    );
  });
});
