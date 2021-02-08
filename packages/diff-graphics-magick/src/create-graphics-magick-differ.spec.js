const mockSize = jest.fn((callback) => callback(null, { with: 1, height: 1 }));

const gm = require('gm');
const createGraphicsMagickDiffer = require('./create-graphics-magick-differ');

jest.mock('fs-extra');
jest.mock('gm', () => {
  const mockGm = jest.fn(() => ({ size: mockSize }));
  mockGm.compare = jest.fn((path1, path2, config, callback) =>
    callback(null, true)
  );
  return mockGm;
});

beforeEach(jest.clearAllMocks);

describe('createGraphicsMagickDiffer', () => {
  const path1 = 'path1';
  const path2 = 'path2';
  const diffPath = 'diffPath';
  const tolerance = 1;

  it('should return false for unequal sizes', async () => {
    mockSize.mockImplementationOnce((callback) =>
      callback(null, { with: 100, height: 100 })
    );
    mockSize.mockImplementationOnce((callback) =>
      callback(null, { with: 100, height: 200 })
    );
    const config = { asdf: '1234' };
    const differ = createGraphicsMagickDiffer(config);
    const isEqual = await differ(path1, path2, diffPath, tolerance);
    expect(isEqual).toBe(false);
  });

  it('should call gm.compare with the correct config', async () => {
    const config = { asdf: '1234' };
    const differ = createGraphicsMagickDiffer(config);
    const isEqual = await differ(path1, path2, diffPath, tolerance);
    expect(isEqual).toBe(true);
    expect(gm.compare).toHaveBeenCalledWith(
      path1,
      path2,
      { asdf: '1234', file: diffPath, tolerance: 0.01 },
      expect.anything()
    );
  });

  it('should override tolerance with the config', async () => {
    const config = { tolerance: 0.2 };
    const differ = createGraphicsMagickDiffer(config);
    await differ(path1, path2, diffPath, tolerance);
    expect(gm.compare).toHaveBeenCalledWith(
      path1,
      path2,
      { file: diffPath, tolerance: 0.2 },
      expect.anything()
    );
  });
});
