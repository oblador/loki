/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs-extra');
const path = require('path');
const Listr = require('listr');
const minimist = require('minimist');
const { warn, die } = require('../../console');
const fetchStories = require('../../storybook/fetch-stories');
const createChromeTarget = require('../../targets/chrome');
const testChromeStory = require('./test-chrome-story');

function test(args) {
  const argv = minimist(args, {
    boolean: ['no-headless'],
    string: ['filter', 'target', 'selector', 'reference', 'output'],
    default: {
      reference: './screenshots/reference',
      output: './screenshots/current',
      concurrency: 4,
      port: 6006,
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

  const configurations = Object.keys(config.configurations)
    .filter(matchesFilter)
    .filter(matchesTarget);

  if (!configurations.length) {
    warn('No matching configurations');
    process.exit(0);
  }

  const options = Object.assign(
    {
      outputDir: path.resolve(argv.output),
      referenceDir: path.resolve(argv.reference),
      baseUrl: `http://localhost:${argv.port}`,
      selector: argv.selector || config.selector,
    },
    config
  );

  fs.emptyDirSync(options.outputDir);

  const tasks = new Listr([
    {
      title: 'Chrome',
      task: () =>
        new Listr([
          {
            title: 'Fetch list of stories',
            task: async ctx => {
              ctx.stories = await fetchStories(options.baseUrl);
            },
          },
          {
            title: 'Launch chrome',
            task: async ctx => {
              const chrome = createChromeTarget();
              await chrome.launch({
                chromeFlags: argv.noHeadless
                  ? ['--hide-scrollbars']
                  : ['--headless', '--disable-gpu', '--hide-scrollbars'],
              });
              ctx.chrome = chrome;
            },
          },
          ...configurations.map(configurationName => ({
            title: `Test ${configurationName}`,
            task: ({ stories }) =>
              new Listr(
                stories.map(component => ({
                  title: component.kind,
                  task: () =>
                    new Listr(
                      component.stories.map(story => ({
                        title: story,
                        task: ({ chrome }) =>
                          testChromeStory(
                            chrome,
                            options,
                            configurationName,
                            component.kind,
                            story
                          ),
                      }))
                    ),
                })),
                { concurrent: argv.concurrency, exitOnError: false }
              ),
          })),
          {
            title: 'Kill chrome',
            task: ctx => ctx.chrome.kill(),
          },
        ]),
    },
  ]);

  tasks.run().catch(() => {
    die('Visual tests failed');
  });
}

module.exports = test;
