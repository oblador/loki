/* eslint-disable no-console */
const {
  EVENT_CHANGE,
  STATUS_FAILED,
  STATUS_SUCCEEDED,
} = require('../task-runner');
const { renderTask } = require('./render-task');

const renderVerbose = taskRunner => {
  const handleChange = task => {
    const message = renderTask(task);
    switch (task.status) {
      case STATUS_FAILED:
        return console.error(message);
      case STATUS_SUCCEEDED:
        return console.log(message);
      default:
        return console.info(message);
    }
  };
  taskRunner.on(EVENT_CHANGE, handleChange);
  const stopRendering = () =>
    taskRunner.removeListener(EVENT_CHANGE, handleChange);
  return stopRendering;
};

module.exports = { renderVerbose };
