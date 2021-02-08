const fs = require('fs-extra');
const looksSame = require('looks-same');

function createLooksSameDiffer(config) {
  return function getImageDiff(path1, path2, diffPath, tolerance) {
    const instanceConfig = { tolerance, ...config };
    return new Promise(async (resolve, reject) => {
      const [reference, current] = (
        await Promise.all([fs.readFile(path1), fs.readFile(path2)])
      ).map(Buffer.from);

      if (current.equals(reference)) {
        return resolve(true);
      }
      if (reference.length === 0) {
        return reject(new Error('Reference image is empty'));
      }
      if (current.length === 0) {
        return reject(new Error('Current image is empty'));
      }

      return looksSame(reference, current, instanceConfig, (err, isSame) => {
        if (err) {
          reject(err);
        } else if (isSame) {
          resolve(isSame);
        } else {
          fs.ensureFileSync(diffPath);
          looksSame.createDiff(
            {
              ...instanceConfig,
              reference,
              current,
              diff: diffPath,
              highlightColor: '#ff00ff',
            },
            (diffErr) => {
              if (diffErr) {
                reject(diffErr);
              }
              resolve(false);
            }
          );
        }
      });
    });
  };
}

module.exports = createLooksSameDiffer;
