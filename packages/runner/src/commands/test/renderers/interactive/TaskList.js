const React = require('react');
const importJsx = require('import-jsx');
const { Static, Box } = require('ink');
const {
  STATUS_NOT_STARTED,
  STATUS_RUNNING,
  STATUS_SUCCEEDED,
  STATUS_FAILED,
} = require('../../task-runner');
const {
  TASK_TYPE_PREPARE,
  TASK_TYPE_START,
  TASK_TYPE_FETCH_STORIES,
  TASK_TYPE_TESTS,
  TASK_TYPE_TEST,
  TASK_TYPE_STOP,
} = require('../../constants');

const Task = importJsx('./Task');
const FailedTest = importJsx('./FailedTest');

const collectRecursively = (predicate, tasks, collection = []) => {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (predicate(task)) {
      collection.push(task);
    }
    if (task.tasks) {
      return collectRecursively(predicate, task.tasks, collection);
    }
  }
  return collection;
};

const isRunningTest = task =>
  task.status === STATUS_RUNNING && task.meta.type === TASK_TYPE_TEST;

const isCompletedTest = task =>
  (task.status === STATUS_FAILED || task.status === STATUS_SUCCEEDED) &&
  task.meta.type === TASK_TYPE_TEST;

const isFailedTest = task =>
  task.status === STATUS_FAILED && task.meta.type === TASK_TYPE_TEST;

const isFailedTask = task =>
  task.status === STATUS_FAILED && task.meta.type !== TASK_TYPE_TESTS;

const groupByKind = testTasks =>
  testTasks.reduce((acc, task) => {
    const key = `${task.meta.target}/${task.meta.configuration}/${task.meta.kind}`;
    if (!acc[key]) {
      acc[key] = {
        target: task.meta.target,
        configuration: task.meta.configuration,
        kind: task.meta.kind,
        tasks: [],
      };
    }
    acc[key].tasks.push(task);
    return acc;
  }, {});

const KindTask = ({ status, target, configuration, kind }) => (
  <Task status={status} prefix={`${target}/${configuration}/`} title={kind} />
);

const TARGET_TASK_TITLE_MAP = {
  [TASK_TYPE_PREPARE]: 'Preparing',
  [TASK_TYPE_START]: 'Starting',
  [TASK_TYPE_FETCH_STORIES]: 'Fetching stories',
  [TASK_TYPE_TESTS]: 'Running tests',
  [TASK_TYPE_STOP]: 'Stopping',
};
const TargetTask = ({ status, target, tasks }) => {
  const currentTask =
    tasks &&
    tasks.find(
      task =>
        task.status === STATUS_NOT_STARTED || task.status === STATUS_RUNNING
    );
  const taskTitle = currentTask && TARGET_TASK_TITLE_MAP[currentTask.meta.type];
  const failedTasks = (tasks || []).filter(isFailedTask);

  return (
    <React.Fragment>
      <Task
        status={status}
        title={`${target}${
          status !== STATUS_FAILED && taskTitle ? `: ${taskTitle}` : ''
        }`}
      />
      {failedTasks.map(task => (
        <FailedTest
          key={task.id}
          title={TARGET_TASK_TITLE_MAP[task.meta.type]}
          error={task.error}
        />
      ))}
    </React.Fragment>
  );
};

const renderFailedTasks = tasks =>
  tasks
    .filter(isFailedTest)
    .map(task => (
      <FailedTest key={task.id} title={task.meta.story} error={task.error} />
    ));

const renderKinds = kinds =>
  kinds.map(({ key, status, target, configuration, kind, tasks }) => (
    <React.Fragment key={key}>
      <KindTask
        status={status}
        target={target}
        configuration={configuration}
        kind={kind}
      />
      {renderFailedTasks(tasks)}
    </React.Fragment>
  ));

const TaskList = ({ tasks }) => {
  const runningGrouped = groupByKind(collectRecursively(isRunningTest, tasks));
  const running = Object.keys(runningGrouped).map(key => ({
    key,
    ...runningGrouped[key],
    status: STATUS_RUNNING,
  }));

  const completedGrouped = groupByKind(
    collectRecursively(isCompletedTest, tasks)
  );
  const completed = Object.keys(completedGrouped)
    .filter(key => !runningGrouped[key])
    .map(key => ({
      key,
      ...completedGrouped[key],
      status: completedGrouped[key].tasks.find(
        test => test.status === STATUS_FAILED
      )
        ? STATUS_FAILED
        : STATUS_SUCCEEDED,
      completedAt: completedGrouped[key].tasks.reduce(
        (acc, task) => Math.max(acc, task.completedAt),
        0
      ),
    }))
    .sort((a, b) => a.completedAt - b.completedAt);

  return (
    <Box flexDirection="column">
      <Static>{renderKinds(completed)}</Static>
      {renderKinds(running)}
      {tasks.map(task => (
        <TargetTask
          key={task.id}
          status={task.status}
          target={task.id}
          tasks={task.tasks}
        />
      ))}
    </Box>
  );
};

module.exports = TaskList;
