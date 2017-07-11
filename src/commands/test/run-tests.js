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

async function runTests(flatConfigurations, options) {
  await fs.emptyDirSync(options.outputDir);
  await fs.emptyDirSync(options.differenceDir);
  await placeGitignore(options.outputDir);

  const createSkipFilter = (configuration, kind, story) => {
    const skipPattern =
      options.skipStoriesPattern || configuration['skip-stories'];
    if (!skipPattern) {
      return () => false;
    }
    const regexp = RegExp(skipPattern);
    return () => regexp.test(`${kind} ${story}`);
  };

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
                    storybook.map(({ kind, stories }) => ({
                      title: kind,
                      task: () =>
                        new Listr(
                          stories.map(story => ({
                            title: story,
                            skip: createSkipFilter(configuration, kind, story),
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
  tasks.run(context).catch(async () => {
    await Promise.all(context.activeTargets.map(target => target.stop()));
    die('Visual tests failed');
  });

  return tasks;
}

module.exports = runTests;
