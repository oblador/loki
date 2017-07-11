/* eslint-disable global-require, import/no-dynamic-require */

const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');
const { warn, die, info } = require('../../console');
const reactDefaults = require('../../config/defaults-react.json');
const reactNativeDefaults = require('../../config/defaults-react-native.json');

const insertAfter = (
  content,
  pattern,
  stringToInsert,
  fallback = 'prepend'
) => {
  const match = content.match(pattern);
  if (match) {
    const insertionIndex = match.index + match[0].length;
    return `${content.substr(
      0,
      insertionIndex
    )}\n${stringToInsert}${content.substr(insertionIndex)}`;
  }
  if (fallback === 'append') {
    return `${content}\n${stringToInsert}\n`;
  }
  return `${stringToInsert}\n${content}`;
};

function init(args) {
  const pkgPath = path.resolve('./package.json');
  const pkg = require(pkgPath);
  const isReactNativeProject = !!pkg.dependencies['react-native'];

  const relative = to => path.relative('.', to);

  const argv = minimist(args, {
    boolean: ['f', 'force'],
    string: ['c', 'config'],
    default: {},
  });

  const force = argv.force || argv.f;
  const storybookPath = path.resolve(
    argv.config ||
      argv.c ||
      argv._[1] ||
      (isReactNativeProject ? 'storybook' : '.storybook')
  );

  if (!fs.pathExistsSync(storybookPath)) {
    die(
      `Storybook config path not found at "${relative(
        storybookPath
      )}", try passing a --config argument`
    );
  }

  if (pkg.loki && !force) {
    die(
      'Loki already configured, re-run with --force to force reconfiguration'
    );
  }

  info('Adding loki defaults to package.json');
  fs.outputJsonSync(
    pkgPath,
    Object.assign({}, pkg, {
      loki: isReactNativeProject ? reactNativeDefaults : reactDefaults,
    }),
    { spaces: 2 }
  );

  if (isReactNativeProject) {
    const storybookjsPath = `${storybookPath}/storybook.js`;
    const storybookjs = fs.readFileSync(storybookjsPath, 'utf8');
    if (storybookjs.indexOf('loki/configure-react-native') !== -1) {
      warn(
        `${relative(
          storybookjsPath
        )} already has loki configuration, skipping...`
      );
    } else {
      info(`Adding loki configuration to ${relative(storybookjsPath)}`);
      const modifiedStorybookjs = insertAfter(
        storybookjs,
        /(require\(|from )['"]@storybook\/react-native['"]\)?;?[ \t]*/,
        "import 'loki/configure-react-native';"
      );
      fs.outputFileSync(storybookjsPath, modifiedStorybookjs);
    }
  } else {
    const configjsPath = `${storybookPath}/config.js`;
    const configjs = fs.readFileSync(configjsPath, 'utf8');
    if (configjs.indexOf('loki/configure-react') !== -1) {
      warn(
        `${relative(configjsPath)} already has loki configuration, skipping...`
      );
    } else {
      info(`Adding loki configuration to ${relative(configjsPath)}`);
      const modifiedConfigjs = insertAfter(
        configjs,
        /(require\(|from )['"]@storybook\/react['"]\)?;?[ \t]*/,
        "import 'loki/configure-react';",
        'append'
      );
      fs.outputFileSync(configjsPath, modifiedConfigjs);
    }
  }
}

module.exports = init;
