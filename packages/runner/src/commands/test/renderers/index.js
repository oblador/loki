const importJsx = require('import-jsx');
const { renderVerbose } = require('./verbose');
const { renderNonInteractive } = require('./non-interactive');

const { renderInteractive } = importJsx('./interactive');

module.exports = { renderInteractive, renderVerbose, renderNonInteractive };
