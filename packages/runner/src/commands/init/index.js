const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');
const { warn, die, info } = require('../../console');
const getDefaults = require('../../config/get-defaults');
const {
  getProjectPackagePath,
  getProjectPackage,
  hasReactNativeDependency,
} = require('../../config/project-package');

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
    return `${content ? `${content}\n` : ''}${stringToInsert}\n`;
  }
  return `${stringToInsert}\n${content}`;
};

function init(args) {
  const pkg = getProjectPackage();
  const isReactNativeProject = hasReactNativeDependency(pkg);

  const relative = (to) => path.relative('.', to);

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
  const modifiedPkg = Object.assign({}, pkg, { loki: getDefaults() });
  fs.outputJsonSync(getProjectPackagePath(), modifiedPkg, { spaces: 2 });

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
  }
}

module.exports = init;
