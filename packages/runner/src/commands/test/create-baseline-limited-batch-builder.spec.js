/* eslint-disable jest/expect-expect */
const fs = require('fs');
const createBaselineLimitedBatchBuilder = require('./create-baseline-limited-batch-builder');
const { getOutputPaths } = require('./get-output-paths');

jest.mock('fs');

const mockOptions = { referenceDir: '/references' };

const mockFsWithTasks = (mockTasks) => {
  const files = mockTasks.reduce((acc, task) => {
    const { referencePath } = getOutputPaths(
      mockOptions,
      task.task.configurationName,
      task.task.kind,
      task.task.story
    );
    acc[referencePath] = task.size;
    return acc;
  }, {});
  fs.statSync.mockImplementation((file) => {
    if (file in files) {
      return {
        size: files[file],
      };
    }
    throw new Error('File not found');
  });
};

const generateTasks = (sizes) =>
  sizes.map((size, i) => ({
    size,
    task: {
      configurationName: 'configuration',
      kind: 'kind',
      story: `story ${i + 1}`,
    },
  }));

const expectBatchLengths = ({ options, limit, tasks, batchSize }) =>
  expect(
    createBaselineLimitedBatchBuilder(options, limit)(tasks, batchSize).map(
      (batch) => batch.length
    )
  );

describe('createBaselineLimitedBatchBuilder', () => {
  const options = mockOptions;
  const batchSize = 5;

  it('limits batch size by reference file size', () => {
    const limit = 10;
    const tasks = generateTasks(new Array(10).fill(limit / 2));
    mockFsWithTasks(tasks);
    expectBatchLengths({ options, limit, tasks, batchSize }).toEqual([
      2,
      2,
      2,
      2,
      2,
    ]);
  });

  it('falls back to batchSize if limit is not reached', () => {
    const limit = 10;
    const tasks = generateTasks(new Array(10).fill(limit / 20));
    mockFsWithTasks(tasks);
    expectBatchLengths({ options, limit, tasks, batchSize }).toEqual([5, 5]);
  });

  it('assumes last known file size if reference is missing', () => {
    const limit = 10;
    const tasks = generateTasks([1, 2, 3, 11, 11, 11, 11, 11, 11, 11]);
    mockFsWithTasks(tasks.slice(0, 3));
    expectBatchLengths({ options, limit, tasks, batchSize }).toEqual([4, 3, 3]);
  });

  it('allows files over the limit', () => {
    const limit = 10;
    const tasks = generateTasks([1, 2, 3, 4, 5, 5, 4, 7, 8, 11]);
    mockFsWithTasks(tasks);
    expectBatchLengths({ options, limit, tasks, batchSize }).toEqual([
      4,
      2,
      1,
      1,
      1,
      1,
    ]);
  });
});
