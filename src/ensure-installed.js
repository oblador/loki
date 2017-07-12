const shell = require('shelljs');
const { MissingDependencyError } = require('./errors');

const DEPENDENCIES = {
  docker: {
    name: 'Docker',
    instructions: 'You can download it from https://www.docker.com/',
  },
  gm: {
    name: 'GraphicsMagick',
    instructions: 'You can install it with: brew install graphicsmagick',
  },
};

function ensureInstalled(dependency) {
  if (!shell.which(dependency)) {
    const dependencyInfo = DEPENDENCIES[dependency];
    if (!dependencyInfo) {
      throw new MissingDependencyError(dependency);
    }
    throw new MissingDependencyError(
      dependencyInfo.name,
      dependencyInfo.instructions
    );
  }
}

module.exports = ensureInstalled;
