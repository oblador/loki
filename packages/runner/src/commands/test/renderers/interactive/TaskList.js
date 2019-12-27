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

const isFailedTest = task =>
  task.status === STATUS_FAILED && task.meta.type === TASK_TYPE_TEST;

const isPassingTest = task =>
  task.status === STATUS_SUCCEEDED && task.meta.type === TASK_TYPE_TEST;

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

  return (
    <Task
      status={status}
      title={`${target}${
        status !== STATUS_FAILED && taskTitle ? `: ${taskTitle}` : ''
      }`}
    />
  );
};

const TaskList = ({ tasks }) => {
  const passedTests = collectRecursively(isPassingTest, tasks);
  const runningTests = collectRecursively(isRunningTest, tasks);
  const failedTests = collectRecursively(isFailedTest, tasks);
  const passedKinds = groupByKind(passedTests);
  const runningKinds = groupByKind(runningTests);
  const failedKinds = groupByKind(failedTests);
  const fullyFailedKindKeys = Object.keys(failedKinds).filter(
    key => !runningKinds[key]
  );
  const fullyPassedKindKeys = Object.keys(passedKinds).filter(
    key => !runningKinds[key] && !failedKinds[key]
  );

  return (
    <Box flexDirection="column">
      <Static>
        {fullyPassedKindKeys
          .map(key => (
            <KindTask
              key={key}
              status={STATUS_SUCCEEDED}
              {...passedKinds[key]}
            />
          ))
          .concat(
            fullyFailedKindKeys.map(key => (
              <React.Fragment key={key}>
                <KindTask status={STATUS_FAILED} {...failedKinds[key]} />
                {failedKinds[key].tasks.map(task => (
                  <FailedTest
                    key={task.id}
                    title={task.meta.story}
                    error={task.error}
                  />
                ))}
              </React.Fragment>
            ))
          )}
      </Static>
      {Object.keys(runningKinds).map(key => (
        <React.Fragment key={key}>
          <KindTask status={STATUS_RUNNING} {...runningKinds[key]} />
          {failedKinds[key] &&
            failedKinds[key].tasks.map(task => (
              <FailedTest
                key={task.id}
                title={task.meta.story}
                error={task.error}
              />
            ))}
        </React.Fragment>
      ))}
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
