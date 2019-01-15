const gm = require('gm');
const imageDiffGenerator = require('../gm.js');

describe('gm.imageDiffGenerator', () => {
  const path1 = 'path1';
  const path2 = 'path2';
  const diffPath = 'diffPath';
  const tolerance = 1;

  it('should call gm.compare with the correct config', () => {
    const config = { asdf: '1234' };
    const gmCompare = jest.fn();
    gm.compare = gmCompare;
    const differ = imageDiffGenerator(config);
    differ(path1, path2, diffPath, tolerance);
    expect(gmCompare).toHaveBeenCalledWith(
      path1,
      path2,
      { asdf: '1234', file: diffPath, tolerance: 0.01 },
      expect.anything()
    );
  });

  it('should override tolerance with the config', () => {
    const config = { tolerance: 0.2 };
    const gmCompare = jest.fn();
    gm.compare = gmCompare;
    const differ = imageDiffGenerator(config);
    differ(path1, path2, diffPath, tolerance);
    expect(gmCompare).toHaveBeenCalledWith(
      path1,
      path2,
      { file: diffPath, tolerance: 0.2 },
      expect.anything()
    );
  });
});
