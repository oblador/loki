const fs = require('fs-extra');
const gm = require('gm');

function imageDiffGenerator(config) {
  return function getImageDiff(path1, path2, diffPath, tolerance) {
    const instanceConfig = { tolerance: tolerance / 100, ...config };
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

module.exports = imageDiffGenerator;
