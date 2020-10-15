const fs = require('fs-extra');
const gm = require('gm');

const getSize = (filePath) =>
  new Promise((resolve, reject) => {
    gm(filePath).size((err, value) => {
      if (err) {
        return reject(err);
      }

      return resolve(value);
    });
  });

const compare = (path1, path2, instanceConfig, diffPath) =>
  new Promise((resolve, reject) => {
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

function createGraphicsMagickDiffer(config) {
  return function getImageDiff(path1, path2, diffPath, tolerance) {
    const instanceConfig = { tolerance: tolerance / 100, ...config };

    return Promise.all([getSize(path1), getSize(path2)]).then(
      ([path1Dimensions, path2Dimensions]) => {
        if (
          path1Dimensions.height !== path2Dimensions.height ||
          path1Dimensions.width !== path2Dimensions.width
        ) {
          return false;
        }

        return compare(path1, path2, instanceConfig, diffPath);
      }
    );
  };
}

module.exports = createGraphicsMagickDiffer;
