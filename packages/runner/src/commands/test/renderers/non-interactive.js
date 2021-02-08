/* eslint-disable no-console */

const {
  EVENT_CHANGE,
  STATUS_FAILED,
  STATUS_SUCCEEDED,
} = require('../task-runner');
const { TASK_TYPE_TESTS, TASK_TYPE_TARGET } = require('../constants');
const { renderTask } = require('./render-task');

const renderNonInteractive = (taskRunner) => {
  const handleChange = (task) => {
    const message = renderTask(task);
    // eslint-disable-next-line default-case
    switch (task.status) {
      case STATUS_FAILED:
        console.error(message);
        if (task.error && task.error.instructions) {
          console.info(task.error.instructions);
        }
        break;

      case STATUS_SUCCEEDED:
        if (
          task.meta.type !== TASK_TYPE_TESTS &&
          task.meta.type !== TASK_TYPE_TARGET
        ) {
          console.log(message);
        }
        break;
    }
  };
  taskRunner.on(EVENT_CHANGE, handleChange);
  const stopRendering = () =>
    taskRunner.removeListener(EVENT_CHANGE, handleChange);
  return stopRendering;
};

module.exports = { renderNonInteractive };
