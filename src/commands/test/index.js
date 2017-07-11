const fs = require('fs-extra');
const path = require('path');
const Listr = require('listr');
const minimist = require('minimist');
const { warn, die } = require('../../console');
const getConfig = require('../../config');
const {
  createChromeAppTarget,
  createChromeDockerTarget,
} = require('../../targets/chrome');
const {
  createIOSSimulatorTarget,
  createAndroidEmulatorTarget,
} = require('../../targets/native');
const testStory = require('./test-story');

async function prepareOutputDir(outputDir) {
  fs.emptyDirSync(outputDir);
  const gitignorePath = `${outputDir}/.gitignore`;
  if (!await fs.pathExists(gitignorePath)) {
    await fs.outputFile(gitignorePath, '*.png\n');
  }
}

async function test(args) {
  const argv = minimist(args, {
    boolean: ['no-headless'],
    string: [
      'host',
      'filter',
      'target',
      'selector',
      'skip',
      'reference',
      'output',
      'difference',
      'diffingEngine',
    ],
    default: {
      reference: './screenshots/reference',
      output: './screenshots/current',
      concurrency: 4,
      host: 'localhost',
      'react-port': 6006,
      'react-native-port': 7007,
    },
  });

  const config = getConfig();

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
    {
      'chrome.app': [],
      'chrome.docker': [],
      'ios.simulator': [],
      'android.emulator': [],
    }
  );

  const options = Object.assign(
    {
      outputDir: path.resolve(argv.output),
      referenceDir: path.resolve(argv.reference),
      differenceDir: path.resolve(argv.difference || `${argv.output}/diff`),
      reactUri: `http://${argv.host}:${argv.port || argv['react-port']}`,
      reactNativeUri: `ws://${argv.host}:${argv.port ||
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

  await prepareOutputDir(options.outputDir);
  await prepareOutputDir(options.differenceDir);

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
      createChromeAppTarget({
        baseUrl: options.reactUri,
        chromeFlags: argv['no-headless']
          ? ['--hide-scrollbars']
          : ['--headless', '--disable-gpu', '--hide-scrollbars'],
      }),
      sortedConfigurations['chrome.app'],
      argv.concurrency,
      2.3
    ),
    getTargetTasks(
      'Chrome (docker)',
      createChromeDockerTarget({
        baseUrl: options.reactUri,
        chromeFlags: ['--hide-scrollbars'],
      }),
      sortedConfigurations['chrome.docker'],
      argv.concurrency,
      2.3
    ),
    getTargetTasks(
      'iOS Simulator',
      createIOSSimulatorTarget(options.reactNativeUri),
      sortedConfigurations['ios.simulator'],
      1,
      0
    ),
    getTargetTasks(
      'Android Emulator',
      createAndroidEmulatorTarget(options.reactNativeUri),
      sortedConfigurations['android.emulator'],
      1,
      0
    ),
  ]);

  tasks.run().catch(() => {
    die('Visual tests failed');
  });
}

module.exports = test;
