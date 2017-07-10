/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs-extra');
const path = require('path');
const Listr = require('listr');
const minimist = require('minimist');
const { warn, die } = require('../../console');
const createChromeTarget = require('../../targets/chrome');
const {
  createIOSSimulatorTarget,
  createAndroidEmulatorTarget,
} = require('../../targets/native');
const testStory = require('./test-story');

function test(args) {
  const argv = minimist(args, {
    boolean: ['no-headless'],
    string: [
      'filter',
      'target',
      'selector',
      'skip',
      'reference',
      'output',
      'diffingEngine',
    ],
    default: {
      reference: './screenshots/reference',
      output: './screenshots/current',
      concurrency: 4,
      'react-port': 6006,
      'react-native-port': 7007,
    },
  });

  const pkg = require(path.resolve('./package.json'));
  if (!pkg.loki) {
    warn(
      'No loki configuration found in package.json, defaulting to 1366x768 laptop for chrome.'
    );
  }

  const config = pkg.loki || require('./default-config.json');

  const filter = argv.filter || argv._[1];
  const matchesFilter = name => !filter || new RegExp(filter).test(name);
  const matchesTarget = name =>
    !argv.target || config.configurations[name].target === argv.target;

  const matchingConfigurations = Object.keys(config.configurations)
    .filter(matchesFilter)
    .filter(matchesTarget);

  if (!matchingConfigurations.length) {
    warn('No matching configurations');
    process.exit(0);
  }

  const sortedConfigurations = matchingConfigurations.reduce(
    (acc, name) => {
      const configuration = config.configurations[name];
      if (!acc[configuration.target]) {
        die(`Invalid target ${configuration.target}`);
      }
      acc[configuration.target].push(name);
      return acc;
    },
    { chrome: [], ios: [], android: [] }
  );

  const options = Object.assign(
    {
      outputDir: path.resolve(argv.output),
      referenceDir: path.resolve(argv.reference),
      reactUri: `http://localhost:${argv.port || argv['react-port']}`,
      reactNativeUri: `ws://localhost:${argv.port ||
        argv['react-native-port']}`,
      selector: argv.selector || config.selector,
    },
    config
  );

  const shouldSkip = (configurationName, kind, story) => {
    const configuration = options.configurations[configurationName];
    const skip = argv.skip || configuration.skip;
    return skip && new RegExp(configuration.skip).test(`${kind} ${story}`);
  };

  fs.emptyDirSync(options.outputDir);

  const getTargetTasks = (
    name,
    target,
    configurations,
    concurrency,
    tolerance
  ) => {
    let storybook;

    return {
      title: name,
      enabled: () => configurations.length > 0,
      task: () =>
        new Listr([
          {
            title: 'Start',
            task: async () => {
              await target.start();
            },
          },
          {
            title: 'Fetch list of stories',
            task: async () => {
              storybook = await target.getStorybook();
            },
          },
          ...configurations.map(configurationName => ({
            title: `Test ${configurationName}`,
            task: () =>
              new Listr(
                storybook.map(({ kind, stories }) => ({
                  title: kind,
                  task: () =>
                    new Listr(
                      stories.map(story => ({
                        title: story,
                        skip: () => shouldSkip(configurationName, kind, story),
                        task: () =>
                          testStory(
                            target,
                            options,
                            tolerance,
                            configurationName,
                            kind,
                            story
                          ),
                      }))
                    ),
                })),
                { concurrent: concurrency, exitOnError: false }
              ),
          })),
          {
            title: 'Stop',
            task: () => target.stop(),
          },
        ]),
    };
  };

  const tasks = new Listr([
    getTargetTasks(
      'Chrome',
      createChromeTarget({
        baseUrl: options.reactUri,
        chromeFlags: argv['no-headless']
          ? ['--hide-scrollbars']
          : ['--headless', '--disable-gpu', '--hide-scrollbars'],
      }),
      sortedConfigurations.chrome,
      argv.concurrency,
      2.3
    ),
    getTargetTasks(
      'iOS Simulator',
      createIOSSimulatorTarget(options.reactNativeUri),
      sortedConfigurations.ios,
      1,
      0
    ),
    getTargetTasks(
      'Android Emulator',
      createAndroidEmulatorTarget(options.reactNativeUri),
      sortedConfigurations.android,
      1,
      0
    ),
  ]);

  tasks.run().catch(() => {
    die('Visual tests failed');
  });
}

module.exports = test;
