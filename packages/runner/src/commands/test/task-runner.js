const EventEmitter = require('events');
const eachOfLimit = require('async/eachOfLimit');

const STATUS_NOT_STARTED = 'NOT_STARTED';
const STATUS_RUNNING = 'RUNNING';
const STATUS_SUCCEEDED = 'SUCCEEDED';
const STATUS_FAILED = 'FAILED';
const EVENT_CHANGE = 'change';
const EVENT_END = 'end';

class TaskRunnerError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'TaskRunnerError';
    this.errors = errors;
  }
}

const getArrayChunks = (array, chunkSize) =>
  Array(Math.ceil(array.length / chunkSize))
    .fill()
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));

class TaskRunner extends EventEmitter {
  constructor(tasks, options = {}) {
    super();
    const defaultOptions = {
      concurrency: 1,
      batchSize: 1,
      batchExector: (batch, context) => batch.map((task) => task.task(context)),
      exitOnError: true,
    };
    const {
      batchExector,
      batchSize,
      batchBuilder,
      concurrency,
      exitOnError,
    } = Object.assign({}, defaultOptions, options);

    this.batchExector = batchExector;
    this.batchSize = batchSize;
    this.batchBuilder = batchBuilder || getArrayChunks;
    this.concurrency = concurrency;
    this.exitOnError = exitOnError;
    if (!Array.isArray(tasks)) {
      throw new Error(
        `tasks argument must be an array, received ${typeof tasks}`
      );
    }
    this.tasks = tasks
      .filter(
        (task) => task && task.enabled !== false && task.meta && task.task
      )
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
    return async (batch) =>
      Promise.all(
        this.batchExector(batch, context).map(async (work, i) => {
          const index = this.tasks.indexOf(batch[i]);
          try {
            const hasSubTasks = work instanceof TaskRunner;
            this.mergeTaskState(index, {
              status: STATUS_RUNNING,
              startedAt: Date.now(),
              subTaskRunner: hasSubTasks ? work : null,
            });
            if (hasSubTasks) {
              work.on(EVENT_CHANGE, (changedTask) =>
                this.emitChange(changedTask)
              );
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
        })
      );
  }

  async run(context) {
    let caughtError;
    try {
      await eachOfLimit(
        this.batchBuilder(this.tasks, this.batchSize),
        this.concurrency,
        this.createTaskIterator(context)
      );
    } catch (error) {
      // Errors might not be thrown due to exitOnError option,
      // so collect all errors by status instead, but keep reference
      // in case error is thrown by the task runner itself
      caughtError = error;
    }
    this.emit(EVENT_END);
    const errors = this.tasks
      .filter((task) => task.status === STATUS_FAILED)
      .map((task) => task.error)
      .reduce((acc, error) => acc.concat(error.errors || error), []);
    if (errors.length !== 0) {
      throw new TaskRunnerError('Some tasks failed to run', errors);
    } else if (caughtError) {
      throw caughtError;
    }
  }
}

module.exports = {
  STATUS_NOT_STARTED,
  STATUS_RUNNING,
  STATUS_SUCCEEDED,
  STATUS_FAILED,
  EVENT_CHANGE,
  EVENT_END,
  TaskRunner,
  TaskRunnerError,
};
