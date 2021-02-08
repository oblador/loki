const React = require('react');
const importJsx = require('import-jsx');
const { render } = require('ink');

const App = importJsx('./App');

const renderInteractive = (taskRunner) => {
  const { unmount } = render(<App taskRunner={taskRunner} />);
  return unmount;
};

module.exports = { renderInteractive };
