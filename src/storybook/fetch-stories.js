const vm = require('vm');
const debug = require('debug')('loki:storybook');
const fetchUrl = require('./fetch-url');
const getBrowserGlobals = require('./get-browser-globals');

async function fetchStories(baseUrl = 'http://localhost:6006') {
  debug(`Fetching iframe HTML and preview bundle JS from ${baseUrl}`);
  const [html, bundle] = await Promise.all([
    fetchUrl(`${baseUrl}/iframe.html`),
    fetchUrl(`${baseUrl}/static/preview.bundle.js`),
  ]);

  debug('Applying browser polyfills');
  const sandbox = vm.createContext(getBrowserGlobals(html));

  debug('Executing storybook preview bundle');
  vm.runInNewContext(bundle, sandbox);

  const getStorybook = sandbox.window.loki && sandbox.window.loki.getStorybook;
  if (!getStorybook) {
    throw new Error(
      "Loki addon not registered. Add `import 'loki/register'` to your config.js file."
    );
  }

  return getStorybook().map(component => ({
    kind: component.kind,
    stories: component.stories.map(story => story.name),
  }));
}

module.exports = fetchStories;
