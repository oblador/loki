const vm = require('vm');
const debug = require('debug')('loki:chrome:fetchStories');
const fetchUrl = require('./fetch-url');
const getBrowserGlobals = require('./get-browser-globals');
const { ServerError } = require('../../errors');

async function fetchStorybook(baseUrl = 'http://localhost:6006') {
  debug(`Fetching iframe HTML and preview bundle JS from ${baseUrl}`);
  let html;
  let bundle;
  try {
    [html, bundle] = await Promise.all([
      fetchUrl(`${baseUrl}/iframe.html`),
      fetchUrl(`${baseUrl}/static/preview.bundle.js`),
    ]);
  } catch (err) {
    if (err.message.indexOf('ECONNREFUSED')) {
      throw new ServerError(
        'Failed fetching stories because the server is down',
        `Try starting it with "yarn storybook" or pass the --port or --host arguments if it's not running at ${baseUrl}`
      );
    }
    throw err;
  }

  debug('Applying browser polyfills');
  const sandbox = vm.createContext(getBrowserGlobals(html));

  debug('Executing storybook preview bundle');
  vm.runInNewContext(bundle, sandbox);

  const getStorybook = sandbox.window.loki && sandbox.window.loki.getStorybook;
  if (!getStorybook) {
    throw new Error(
      "Loki addon not registered. Add `import 'loki/configure-react'` to your config.js file."
    );
  }

  return getStorybook().map(component => ({
    kind: component.kind,
    stories: component.stories.map(story => story.name),
  }));
}

module.exports = fetchStorybook;
