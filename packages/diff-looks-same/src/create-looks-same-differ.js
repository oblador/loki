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

      try {
        const { equal } = await looksSame(reference, current, instanceConfig);
        if (equal) {
          resolve(equal);
        } else {
          fs.ensureFileSync(diffPath);
          const diff = await looksSame.createDiff({
            ...instanceConfig,
            reference,
            current,
            diff: diffPath,
            highlightColor: '#ff00ff',
          });
          resolve(diff);
        }
      } catch (err) {
        reject(err);
      }
    });
  };
}

module.exports = createLooksSameDiffer;
