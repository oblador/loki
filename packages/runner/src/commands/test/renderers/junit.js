/* eslint-disable no-console */
const fs = require('fs-extra');
const path = require('path');
const builder = require('junit-report-builder');

const {
  EVENT_CHANGE,
  EVENT_END,
  STATUS_FAILED,
  STATUS_SUCCEEDED,
} = require('../task-runner');
const { TASK_TYPE_TEST } = require('../constants');

const renderJUnit = (taskRunner, options = {}) => {
  const outputFile = options.junitOutputFile || 'loki-junit-report.xml';
  const suite = builder.testSuite().name('Loki Visual Tests');
  const testCases = new Map();

  const handleChange = (task) => {
    if (task.meta.type !== TASK_TYPE_TEST) {
      return;
    }

    const testId = `${task.meta.target}/${task.meta.configuration}/${task.meta.kind}/${task.meta.story}`;
    
    if (task.status === STATUS_FAILED || task.status === STATUS_SUCCEEDED) {
      let testCase;
      
      if (!testCases.has(testId)) {
        testCase = suite.testCase()
          .className(`${task.meta.target}.${task.meta.configuration}`)
          .name(`${task.meta.kind} - ${task.meta.story}`);
        testCases.set(testId, testCase);
      } else {
        testCase = testCases.get(testId);
      }

      if (task.status === STATUS_FAILED) {
        const errorMessage = task.error ? task.error.message : 'Visual difference detected';
        testCase.failure(errorMessage);
      }
    }
  };

  const handleEnd = () => {
    // Ensure the output directory exists
    const outputDir = path.dirname(outputFile);
    fs.ensureDirSync(outputDir);
    
    // Write the JUnit XML report
    builder.writeTo(outputFile);
    console.log(`JUnit XML report written to ${outputFile}`);
  };

  taskRunner.on(EVENT_CHANGE, handleChange);
  taskRunner.on(EVENT_END, handleEnd);
  
  const stopRendering = () => {
    taskRunner.removeListener(EVENT_CHANGE, handleChange);
    taskRunner.removeListener(EVENT_END, handleEnd);
  };
  
  return stopRendering;
};

module.exports = { renderJUnit }; 