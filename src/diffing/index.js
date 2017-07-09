const getImageDiffWithGm = require('./gm');
const getImageDiffLooksSame = require('./looks-same');

function getImageDiffer(engine) {
  switch (engine) {
    case undefined:
    case 'looks-same': {
      return getImageDiffLooksSame;
    }
    case 'gm': {
      return getImageDiffWithGm;
    }
    default: {
      throw new Error(`Unsupported engine "${engine}"`);
    }
  }
}

module.exports = {
  getImageDiffer,
  getImageDiffWithGm,
  getImageDiffLooksSame,
};
