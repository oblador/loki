/* eslint-disable no-console */

const { EVENT_CHANGE, STATUS_FAILED } = require('../task-runner');
const { TASK_TYPE_TESTS, TASK_TYPE_TARGET } = require('../constants');
const { renderTask } = require('./render-task');

const renderSilent = (taskRunner) => {
  const handleChange = (task) => {
    if (
      task.status === STATUS_FAILED &&
      task.meta.type !== TASK_TYPE_TESTS &&
      task.meta.type !== TASK_TYPE_TARGET
    ) {
      console.error(renderTask(task));
      if (task.error && task.error.instructions) {
        console.info(task.error.instructions);
      }
    }
  };
  taskRunner.on(EVENT_CHANGE, handleChange);
  const stopRendering = () =>
    taskRunner.removeListener(EVENT_CHANGE, handleChange);
  return stopRendering;
};

module.exports = { renderSilent };
