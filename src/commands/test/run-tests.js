const fs = require('fs-extra');
const Listr = require('listr');
const map = require('ramda/src/map');
const groupBy = require('ramda/src/groupBy');
const toPairs = require('ramda/src/toPairs');
const fromPairs = require('ramda/src/fromPairs');
const mapObjIndexed = require('ramda/src/mapObjIndexed');
const { die } = require('../../console');
const {
  createChromeAppTarget,
  createChromeDockerTarget,
  createIOSSimulatorTarget,
  createAndroidEmulatorTarget,
} = require('../../targets');
const testStory = require('./test-story');

async function placeGitignore(outputDir) {
  const gitignorePath = `${outputDir}/.gitignore`;
  if (!await fs.pathExists(gitignorePath)) {
    await fs.outputFile(gitignorePath, '*.png\n');
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
  if (!options.updateReference) {
    await fs.emptyDirSync(options.outputDir);
    await fs.emptyDirSync(options.differenceDir);
    await placeGitignore(options.outputDir);
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
        new Listr([
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
            },
          },
          ...Object.values(
            mapObjIndexed(
              (configuration, configurationName) => ({
                title: `Test ${configurationName}`,
                task: () =>
                  new Listr(
                    filterStorybook(
                      storybook,
                      options.skipStoriesPattern ||
                        configuration['skip-stories'],
                      options.filterStoriesPattern ||
                        configuration['filter-stories']
                    ).map(({ kind, stories }) => ({
                      title: kind,
                      task: () =>
                        new Listr(
                          stories.map(story => ({
                            title: story,
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
            chromeFlags: options.chromeFlags,
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

  const tasks = new Listr(
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
