const fs = require('fs');
const { getOutputPaths } = require('./get-output-paths');

const LAMBDA_PAYLOAD_LIMIT = 6291556; // in bytes
const BASE64_ENCODING_OVERHEAD = 4 / 3;
const FILL_RATE = 0.9;
const DEFAULT_SIZE_LIMIT =
  FILL_RATE * (LAMBDA_PAYLOAD_LIMIT / BASE64_ENCODING_OVERHEAD);

const createBaselineLimitedBatchBuilder = (
  options,
  baselineSizeLimit = DEFAULT_SIZE_LIMIT
) => (tasks, batchSize) => {
  let currentBatch = [];
  let accumulatedBatchSize = 0;
  let lastFileSize = 200 * 1024;
  const batches = [currentBatch];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const { referencePath } = getOutputPaths(
      options,
      task.task.configurationName,
      task.task.kind,
      task.task.story
    );
    let size;
    try {
      const stat = fs.statSync(referencePath);
      // eslint-disable-next-line prefer-destructuring
      size = stat.size;
      lastFileSize = size;
    } catch (e) {
      size = lastFileSize;
    }
    if (
      currentBatch.length >= batchSize ||
      (accumulatedBatchSize + size > baselineSizeLimit &&
        currentBatch.length !== 0)
    ) {
      currentBatch = [];
      accumulatedBatchSize = 0;
      batches.push(currentBatch);
    }
    currentBatch.push(task);
    accumulatedBatchSize += size;
  }
  return batches;
};

module.exports = createBaselineLimitedBatchBuilder;
