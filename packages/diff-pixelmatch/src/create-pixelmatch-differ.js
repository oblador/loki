const fs = require('fs-extra');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

const resizeImage = (original, width, height) => {
  const resized = new PNG({ width, height, fill: true });
  PNG.bitblt(original, resized, 0, 0, original.width, original.height, 0, 0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y > original.height || x > original.width) {
        // eslint-disable-next-line no-bitwise
        const idx = (width * y + x) << 2;
        resized.data[idx] = 0;
        resized.data[idx + 1] = 0;
        resized.data[idx + 2] = 0;
        resized.data[idx + 3] = 64;
      }
    }
  }
  return resized;
};

function createPixelmatchDiffer(config, includeReferenceOnDiff = false) {
  return async function getImageDiff(path1, path2, diffPath, tolerance) {
    let [reference, current] = await Promise.all([
      fs.readFile(path1),
      fs.readFile(path2),
    ]);

    if (current.equals(reference)) {
      return true;
    }
    if (reference.length === 0) {
      throw new Error('Reference image is empty');
    }
    if (current.length === 0) {
      throw new Error('Current image is empty');
    }

    reference = PNG.sync.read(reference);
    current = PNG.sync.read(current);

    const width = Math.max(reference.width, current.width);
    const height = Math.max(reference.height, current.height);

    if (
      reference.height !== current.height ||
      reference.width !== current.width
    ) {
      reference = resizeImage(reference, width, height);
      current = resizeImage(current, width, height);
    }

    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(
      reference.data,
      current.data,
      diff.data,
      width,
      height,
      { threshold: tolerance / 100, ...config }
    );
    const isEqual = numDiffPixels === 0;
    if (!isEqual) {
      if (!includeReferenceOnDiff) {
        await fs.outputFile(diffPath, PNG.sync.write(diff));
      } else {
        const diffCombined = new PNG({ width: width * 3, height });
        PNG.bitblt(reference, diffCombined, 0, 0, width, height, width * 0);
        PNG.bitblt(current, diffCombined, 0, 0, width, height, width * 1);
        diff.bitblt(diffCombined, 0, 0, width, height, width * 2);
        await fs.outputFile(diffPath, PNG.sync.write(diffCombined));
      }
    }
    return isEqual;
  };
}

module.exports = createPixelmatchDiffer;
