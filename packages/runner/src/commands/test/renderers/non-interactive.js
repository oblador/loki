const {
  EVENT_CHANGE,
  STATUS_FAILED,
  STATUS_SUCCEEDED,
} = require('../task-runner');
const { TASK_TYPE_TEST } = require('../constants');
const { renderTask } = require('./render-task');

const renderNonInteractive = taskRunner => {
  const handleChange = task => {
    if (
      (task.status === STATUS_FAILED || task.status === STATUS_SUCCEEDED) &&
      task.meta.type === TASK_TYPE_TEST
    ) {
      // eslint-disable-next-line no-console
      console.error(renderTask(task));
    }
  };
  taskRunner.on(EVENT_CHANGE, handleChange);
  const stopRendering = () =>
    taskRunner.removeListener(EVENT_CHANGE, handleChange);
  return stopRendering;
};

module.exports = { renderNonInteractive };
