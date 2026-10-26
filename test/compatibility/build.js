const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const fixture = process.argv[2];
const source = path.join(__dirname, 'fixtures', fixture);
const project = path.join(__dirname, 'generated', fixture);
const manifest = JSON.parse(fs.readFileSync(path.join(source, 'package.json')));
const major = Number(manifest.dependencies['@storybook/react'].split('.')[0]);
const builder = fixture.split('-').pop();

fs.mkdirSync(project, { recursive: true });
['package.json', 'package-lock.json'].forEach((file) => {
  fs.copyFileSync(path.join(source, file), path.join(project, file));
});
['stories', 'public'].forEach((directory) => {
  fs.cpSync(path.join(__dirname, directory), path.join(project, directory), {
    recursive: true,
  });
});
if (major === 5) {
  fs.appendFileSync(
    path.join(project, 'stories/Button.stories.js'),
    '\nSkipped.story = { parameters: { loki: { skip: true } } };\n'
  );
}
const config = { stories: ['../stories/**/*.stories.js'], addons: [] };
if (major >= 6) config.staticDirs = ['../public'];
if (major >= 7) {
  config.framework = { name: `@storybook/react-${builder}`, options: {} };
}
fs.mkdirSync(path.join(project, '.storybook'), { recursive: true });
fs.writeFileSync(
  path.join(project, '.storybook/main.js'),
  `module.exports = ${JSON.stringify(config, null, 2)};\n`
);

const env = {
  ...process.env,
  CI: 'true',
  STORYBOOK_DISABLE_TELEMETRY: '1',
  NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''}${
    major <= 6 ? ' --openssl-legacy-provider' : ''
  }`,
};
const run = (command, args) =>
  execFileSync(command, args, { cwd: project, env, stdio: 'inherit' });

run('npm', [
  'ci',
  '--legacy-peer-deps',
  '--no-audit',
  '--no-fund',
  '--workspaces=false',
]);
run(
  process.execPath,
  major <= 6
    ? [
        'node_modules/.bin/build-storybook',
        '--output-dir',
        'dist',
        ...(major === 5 ? ['-s', 'public'] : []),
      ]
    : [
        'node_modules/.bin/storybook',
        'build',
        '--output-dir',
        'dist',
        '--quiet',
      ]
);
