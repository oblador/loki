const fs = require('fs-extra');
const gm = require('gm');
const imageSize = require('image-size');

function createGraphicsMagickDiffer(config) {
  return function getImageDiff(path1, path2, diffPath, tolerance) {
    const instanceConfig = { tolerance: tolerance / 100, ...config };

    const path1Dimensions = imageSize(path1);
    const path2Dimensions = imageSize(path2);

    if (
      path1Dimensions.height !== path2Dimensions.height ||
      path1Dimensions.width !== path2Dimensions.width
    ) {
      return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => {
      gm.compare(
        path1,
        path2,
        { ...instanceConfig, file: diffPath },
        (err, isEqual) => {
          if (err) {
            if (typeof err === 'string') {
              reject(new Error(err));
            } else {
              reject(err);
            }
          } else {
            if (isEqual) {
              fs.remove(diffPath);
            }
            resolve(isEqual);
          }
        }
      );
    });
  };
}

module.exports = createGraphicsMagickDiffer;
