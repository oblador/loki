/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs-extra');
const path = require('path');
const Listr = require('listr');
const minimist = require('minimist');
const { warn, die } = require('../../console');
const createChromeTarget = require('../../targets/chrome');
const createIOSSimulatorTarget = require('../../targets/ios-simulator');
const testStory = require('./test-story');

function test(args) {
  const argv = minimist(args, {
    boolean: ['no-headless'],
    string: ['filter', 'target', 'selector', 'reference', 'output'],
    default: {
      reference: './screenshots/reference',
      output: './screenshots/current',
      concurrency: 4,
      reactPort: 6006,
      reactNativePort: 7007,
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
      acc[configuration.target].push(name);
      return acc;
    },
    { chrome: [], ios: [] }
  );

  const options = Object.assign(
    {
      outputDir: path.resolve(argv.output),
      referenceDir: path.resolve(argv.reference),
      reactUri: `http://localhost:${argv.port || argv.reactPort}`,
      reactNativeUri: `ws://localhost:${argv.port || argv.reactNativePort}`,
      selector: argv.selector || config.selector,
    },
    config
  );

  fs.emptyDirSync(options.outputDir);

  const getTargetTasks = (name, target, configurations, concurrency, tolerance) => {
    let storybook;

    return {
      title: name,
      enabled: () => configurations.length > 0,
      task: () =>
        new Listr([
          {
            title: 'Starting',
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
                storybook.map(component => ({
                  title: component.kind,
                  task: () =>
                    new Listr(
                      component.stories.map(story => ({
                        title: story,
                        task: () =>
                          testStory(
                            target,
                            options,
                            tolerance,
                            configurationName,
                            component.kind,
                            story
                          ),
                      }))
                    ),
                })),
                { concurrent: concurrency, exitOnError: false }
              ),
          })),
          {
            title: 'Stopping',
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
        chromeFlags: argv.noHeadless
          ? ['--hide-scrollbars']
          : ['--headless', '--disable-gpu', '--hide-scrollbars'],
      }),
      sortedConfigurations.chrome,
      argv.concurrency,
      0.03,
    ),
    getTargetTasks(
      'iOS Simulator',
      createIOSSimulatorTarget(options.reactNativeUri),
      sortedConfigurations.ios,
      1,
      0
    ),
  ], { concurrent: true });

  tasks.run().catch(() => {
    die('Visual tests failed');
  });
}

module.exports = test;
