const EventEmitter = require('events');
const eachOfLimit = require('async/eachOfLimit');

const STATUS_NOT_STARTED = 'NOT_STARTED';
const STATUS_RUNNING = 'RUNNING';
const STATUS_SUCCEEDED = 'SUCCEEDED';
const STATUS_FAILED = 'FAILED';
const EVENT_CHANGE = 'change';

class TaskRunnerError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'TaskRunnerError';
    this.errors = errors;
  }
}

class TaskRunner extends EventEmitter {
  constructor(tasks, options = {}) {
    super();
    const defaultOptions = {
      concurrency: 1,
      exitOnError: true,
    };
    const { concurrency, exitOnError } = Object.assign(
      {},
      defaultOptions,
      options
    );
    this.concurrency = concurrency;
    this.exitOnError = exitOnError;
    if (!Array.isArray(tasks)) {
      throw new Error(
        `tasks argument must be an array, received ${typeof tasks}`
      );
    }
    this.tasks = tasks
      .filter(task => task && task.enabled !== false && task.meta && task.task)
      .map(({ id, meta, task }, index) => ({
        id: id || index,
        meta,
        task,
        status: STATUS_NOT_STARTED,
        error: null,
        startedAt: null,
        completedAt: null,
      }));
  }

  mergeTaskState(index, state) {
    const task = this.tasks[index];
    if (!task) {
      throw new Error(`No task for index ${task}`);
    }
    const mergedTask = Object.assign({}, task, state);
    this.tasks.splice(index, 1, mergedTask);
    this.emitChange(mergedTask);
  }

  getState() {
    return this.tasks.map(
      ({ id, meta, status, startedAt, completedAt, error, subTaskRunner }) => ({
        id,
        meta,
        status,
        error,
        startedAt,
        completedAt,
        tasks: subTaskRunner ? subTaskRunner.getState() : null,
      })
    );
  }

  emitChange(changedTask) {
    this.emit(EVENT_CHANGE, changedTask);
  }

  createTaskIterator(context) {
    return async (task, index) => {
      try {
        const work = task.task(context);
        const hasSubTasks = work instanceof TaskRunner;
        this.mergeTaskState(index, {
          status: STATUS_RUNNING,
          startedAt: Date.now(),
          subTaskRunner: hasSubTasks ? work : null,
        });
        if (hasSubTasks) {
          work.on(EVENT_CHANGE, changedTask => this.emitChange(changedTask));
          await Promise.resolve(work.run(context));
        } else {
          await work;
        }
        this.mergeTaskState(index, {
          status: STATUS_SUCCEEDED,
          completedAt: Date.now(),
        });
      } catch (error) {
        this.mergeTaskState(index, {
          status: STATUS_FAILED,
          completedAt: Date.now(),
          error,
        });
        if (this.exitOnError) {
          throw error;
        }
      }
    };
  }

  async run(context) {
    try {
      await eachOfLimit(
        this.tasks,
        this.concurrency,
        this.createTaskIterator(context)
      );
    } catch (_) {
      // Errors might not be thrown due to exitOnError option,
      // so collect all errors by status instead
    }
    const errors = this.tasks
      .filter(task => task.status === STATUS_FAILED)
      .map(task => task.error)
      .reduce((acc, error) => acc.concat(error.errors || error), []);
    if (errors.length !== 0) {
      throw new TaskRunnerError('Some tasks failed to run', errors);
    }
  }
}

module.exports = {
  STATUS_NOT_STARTED,
  STATUS_RUNNING,
  STATUS_SUCCEEDED,
  STATUS_FAILED,
  EVENT_CHANGE,
  TaskRunner,
  TaskRunnerError,
};
