const { createGraphicsMagickDiffer } = require('@loki/diff-graphics-magick');
const { createLooksSameDiffer } = require('@loki/diff-looks-same');
const { createPixelmatchDiffer } = require('@loki/diff-pixelmatch');

function getImageDiffer(engine, config) {
  switch (engine) {
    case undefined:
    case 'pixelmatch': {
      return createPixelmatchDiffer(config);
    }
    case 'looks-same': {
      return createLooksSameDiffer(config);
    }
    case 'gm': {
      return createGraphicsMagickDiffer(config);
    }
    default: {
      throw new Error(`Unsupported engine "${engine}"`);
    }
  }
}

module.exports = { getImageDiffer };
