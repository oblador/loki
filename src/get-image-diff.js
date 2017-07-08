const gm = require('gm');

function getImageDiff(path1, path2, diffPath, options = {}) {
  return new Promise((resolve, reject) => {
    gm.compare(
      path1,
      path2,
      Object.assign({ file: diffPath, tolerance: 0.05 }, options),
      (err, isEqual) => {
        if (err) {
          reject(err);
        } else {
          resolve(isEqual);
        }
      }
    );
  });
}

module.exports = getImageDiff;
