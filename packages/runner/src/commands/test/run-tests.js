const fs = require('fs-extra');
const path = require('path');
const Listr = require('listr');
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

const getListr = options => (tasks, listrOptions = {}) => {
  const newOptions = listrOptions;
  if (options.verboseRenderer) {
    newOptions.renderer = 'verbose';
  }
  return new Listr(tasks, newOptions);
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
    name,
    target,
    configurations,
    concurrency = 1,
    tolerance = 0
  ) => {
    let storybook;

    return {
      title: name,
      task: () =>
        getListr(options)([
          {
            title: 'Prepare environment',
            task: async () => {
              await target.prepare();
            },
            enabled: () => !!target.prepare,
          },
          {
            title: 'Start',
            task: async ({ activeTargets }) => {
              await target.start();
              activeTargets.push(target);
            },
          },
          {
            title: 'Fetch list of stories',
            task: async () => {
              storybook = await target.getStorybook();
              if (storybook.length === 0) {
                throw new Error('Error: No stories were found.');
              }
            },
          },
          ...Object.values(
            mapObjIndexed(
              (configuration, configurationName) => ({
                title: `Test ${configurationName}`,
                task: () =>
                  getListr(options)(
                    filterStorybook(
                      storybook,
                      options.skipStoriesPattern || configuration.skipStories,
                      options.storiesFilter || configuration.storiesFilter
                    ).map(({ kind, stories }) => ({
                      title: kind,
                      task: () =>
                        getListr(options)(
                          stories.map(story => ({
                            title: options.verboseRenderer
                              ? `${kind}: ${story}`
                              : story,
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
                        ),
                    })),
                    { concurrent: concurrency, exitOnError: false }
                  ),
              }),
              configurations
            )
          ),
          {
            title: 'Stop',
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
          'Chrome (app)',
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
          'Chrome (docker)',
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
          'iOS Simulator',
          createIOSSimulatorTarget(options.reactNativeUri),
          configurations
        );
      }
      case 'android.emulator': {
        return getTargetTasks(
          'Android Emulator',
          createAndroidEmulatorTarget(options.reactNativeUri),
          configurations
        );
      }
      default: {
        return die(`Unknown target "${target}`);
      }
    }
  };

  const tasks = getListr(options)(
    Object.values(map(createTargetTask, groupByTarget(flatConfigurations)))
  );

  const context = { activeTargets: [] };
  try {
    await tasks.run(context);
  } catch (err) {
    await Promise.all(context.activeTargets.map(target => target.stop()));
    throw err;
  }
}

module.exports = runTests;
