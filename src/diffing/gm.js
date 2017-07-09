const fs = require('fs-extra');
const gm = require('gm');

function getImageDiff(path1, path2, diffPath, tolerance) {
  return new Promise((resolve, reject) => {
    gm.compare(
      path1,
      path2,
      { file: diffPath, tolerance: tolerance / 100 },
      (err, isEqual) => {
        if (err) {
          reject(err);
        } else {
          if (isEqual) {
            fs.remove(diffPath);
          }
          resolve(isEqual);
        }
      }
    );
  });
}

module.exports = getImageDiff;
