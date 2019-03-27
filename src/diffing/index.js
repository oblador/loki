const getImageDiffWithGm = require('./gm');
const getImageDiffLooksSame = require('./looks-same');

function getImageDiffer(engine, config) {
  switch (engine) {
    case undefined:
    case 'looks-same': {
      return getImageDiffLooksSame(config);
    }
    case 'gm': {
      return getImageDiffWithGm(config);
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
