const looksSame = require('looks-same');

function getImageDiff(path1, path2, diffPath, tolerance) {
  return new Promise((resolve, reject) => {
    looksSame(path1, path2, (err, isSame) => {
      if (err) {
        reject(err);
      } else if (isSame) {
        resolve(isSame);
      } else {
        looksSame.createDiff(
          {
            reference: path1,
            current: path2,
            diff: diffPath,
            tolerance,
            highlightColor: '#ff00ff',
          },
          diffErr => {
            if (diffErr) {
              reject(diffErr);
            }
            resolve(false);
          }
        );
      }
    });
  });
}

module.exports = getImageDiff;
