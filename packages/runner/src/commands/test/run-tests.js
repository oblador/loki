const fs = require('fs-extra');
const path = require('path');
const ciInfo = require('ci-info');
const map = require('ramda/src/map');
const groupBy = require('ramda/src/groupBy');
const toPairs = require('ramda/src/toPairs');
const fromPairs = require('ramda/src/fromPairs');
const mapObjIndexed = require('ramda/src/mapObjIndexed');
const { createChromeAppTarget } = require('@loki/target-chrome-app');
const { createChromeDockerTarget } = require('@loki/target-chrome-docker');
const {
  createIOSSimulatorTarget,
} = require('@loki/target-native-ios-simulator');
const {
  createAndroidEmulatorTarget,
} = require('@loki/target-native-android-emulator');
const { die } = require('../../console');
const testStory = require('./test-story');
const { TaskRunner } = require('./task-runner');
const {
  renderInteractive,
  renderVerbose,
  renderNonInteractive,
} = require('./renderers');
const {
  TASK_TYPE_TARGET,
  TASK_TYPE_PREPARE,
  TASK_TYPE_START,
  TASK_TYPE_FETCH_STORIES,
  TASK_TYPE_TESTS,
  TASK_TYPE_TEST,
  TASK_TYPE_STOP,
} = require('./constants');

const defaultRenderer = ciInfo.isCI ? renderNonInteractive : renderInteractive;

async function placeGitignore(pathsToIgnore) {
  const parentDir = path.dirname(pathsToIgnore[0]);
  const gitignorePath = `${parentDir}/.gitignore`;
  if (!(await fs.pathExists(gitignorePath))) {
    const relativeToParent = p => path.relative(parentDir, p);
    const isDecendant = p => p.indexOf('..') !== 0;
    const gitignore = pathsToIgnore
      .map(relativeToParent)
      .filter(isDecendant)
      .concat(['']) // For last empty newline
      .join('\n');
    await fs.outputFile(gitignorePath, gitignore);
  }
}

const groupByTarget = configurations =>
  mapObjIndexed(
    fromPairs,
    groupBy(([, { target }]) => target, toPairs(configurations))
  );

const filterStorybook = (storybook, excludePattern, includePattern) => {
  const filterStory = kind => story => {
    const fullStoryName = `${kind} ${story}`;
    const exclude =
      excludePattern && new RegExp(excludePattern, 'i').test(fullStoryName);
    const include =
      !includePattern || new RegExp(includePattern, 'i').test(fullStoryName);
    return !exclude && include;
  };

  return storybook
    .map(({ kind, stories }) => ({
      kind,
      stories: stories.filter(filterStory(kind)),
    }))
    .filter(({ stories }) => stories.length !== 0);
};

async function runTests(flatConfigurations, options) {
  if (options.updateReference) {
    await fs.ensureDir(options.referenceDir);
  } else {
    await fs.emptyDirSync(options.outputDir);
    await fs.emptyDirSync(options.differenceDir);
    await placeGitignore([options.outputDir, options.differenceDir]);
  }

  const getTargetTasks = (
    targetName,
    target,
    configurations,
    concurrency = 1,
    tolerance = 0
  ) => {
    let storybook;

    return {
      id: targetName,
      meta: {
        type: TASK_TYPE_TARGET,
      },
      task: () =>
        new TaskRunner([
          {
            id: `${targetName}/${TASK_TYPE_PREPARE}`,
            meta: {
              target: targetName,
              type: TASK_TYPE_PREPARE,
            },
            task: async () => {
              await target.prepare();
            },
            enabled: !!target.prepare,
          },
          {
            id: `${targetName}/${TASK_TYPE_START}`,
            meta: {
              target: targetName,
              type: TASK_TYPE_START,
            },
            task: async ({ activeTargets }) => {
              await target.start();
              activeTargets.push(target);
            },
          },
          {
            id: `${targetName}/${TASK_TYPE_FETCH_STORIES}`,
            meta: {
              target: targetName,
              type: TASK_TYPE_FETCH_STORIES,
            },
            task: async () => {
              storybook = await target.getStorybook();
              if (storybook.length === 0) {
                throw new Error('Error: No stories were found.');
              }
            },
          },
          {
            id: `${targetName}/${TASK_TYPE_TESTS}`,
            meta: {
              target: targetName,
              type: TASK_TYPE_TESTS,
            },
            task: () =>
              new TaskRunner(
                Object.keys(configurations).reduce(
                  (tasks, configurationName) => {
                    const configuration = configurations[configurationName];
                    const kinds = filterStorybook(
                      storybook,
                      options.skipStoriesPattern || configuration.skipStories,
                      options.storiesFilter || configuration.storiesFilter
                    );
                    return tasks.concat(
                      kinds
                        .map(({ kind, stories }) =>
                          stories.map(story => ({
                            id: `${targetName}/${TASK_TYPE_TEST}/${configurationName}/${kind}/${story}`,
                            meta: {
                              target: targetName,
                              configuration: configurationName,
                              kind,
                              story,
                              type: TASK_TYPE_TEST,
                            },
                            task: () =>
                              testStory(
                                target,
                                options,
                                tolerance,
                                configuration,
                                configurationName,
                                kind,
                                story
                              ),
                          }))
                        )
                        .reduce((acc, array) => acc.concat(array), [])
                    );
                  },
                  []
                ),
                { concurrency, exitOnError: false }
              ),
          },
          {
            id: `${targetName}/${TASK_TYPE_STOP}`,
            meta: {
              target: targetName,
              type: TASK_TYPE_STOP,
            },
            task: async ({ activeTargets }) => {
              await target.stop();
              const index = activeTargets.indexOf(target);
              if (index !== -1) {
                activeTargets.splice(index, 1);
              }
            },
          },
        ]),
    };
  };

  const createTargetTask = configurations => {
    const { target } = configurations[Object.keys(configurations)[0]];
    switch (target) {
      case 'chrome.app': {
        return getTargetTasks(
          target,
          createChromeAppTarget({
            baseUrl: options.reactUri,
            chromeFlags: options.chromeFlags,
          }),
          configurations,
          options.chromeConcurrency,
          options.chromeTolerance
        );
      }
      case 'chrome.docker': {
        return getTargetTasks(
          target,
          createChromeDockerTarget({
            baseUrl: options.reactUri,
            chromeDockerImage: options.chromeDockerImage,
            chromeFlags: options.chromeFlags,
            dockerWithSudo: options.dockerWithSudo,
            chromeDockerWithoutSeccomp: options.chromeDockerWithoutSeccomp,
          }),
          configurations,
          options.chromeConcurrency,
          options.chromeTolerance
        );
      }
      case 'ios.simulator': {
        return getTargetTasks(
          target,
          createIOSSimulatorTarget(options.reactNativeUri),
          configurations
        );
      }
      case 'android.emulator': {
        return getTargetTasks(
          target,
          createAndroidEmulatorTarget(options.reactNativeUri),
          configurations
        );
      }
      default: {
        return die(`Unknown target "${target}`);
      }
    }
  };

  const tasks = new TaskRunner(
    Object.values(map(createTargetTask, groupByTarget(flatConfigurations)))
  );

  const context = { activeTargets: [] };
  const render = options.verboseRenderer ? renderVerbose : defaultRenderer;
  const stopRendering = render(tasks);

  try {
    await tasks.run(context);
    stopRendering();
  } catch (err) {
    stopRendering();
    await Promise.all(context.activeTargets.map(target => target.stop()));
    throw err;
  }
}

module.exports = runTests;
