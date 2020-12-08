const importJsx = require('import-jsx');
const { renderVerbose } = require('./verbose');
const { renderNonInteractive } = require('./non-interactive');
const { renderSilent } = require('./silent');

const { renderInteractive } = importJsx('./interactive');

module.exports = {
  renderInteractive,
  renderVerbose,
  renderSilent,
  renderNonInteractive,
};
