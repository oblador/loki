/**
 * Storybook V8 initilization includes a fetch call to the index.json file. The index.json file includes a json object
 * with all the stories from the storybook build.
 *
 * Since Loki is accessing the storybook build using file-based urls (file://tmp/storybook-static/iframe.html),
 * Chromium will not be able to fetch the index.json file. (Fetch calls are blocked for security reasons.)
 *
 * This function handles the fetch call to the index.json file and returns the content of the file based on the
 * storiesJson parameter.
 *
 * If this function doesn't do it, we would get 'failed to fetch' errors instead of the stories being rendered.
 *
 * @param {Window} window - The window object.
 * @param {string} storiesJson - The json object with all the stories from the storybook build.
 */
const handleStoriesFetch = function (window, storiesJson) {
  const originalFetch = window.fetch;

  const mockedFetch = (url, options) => {
    if (url.endsWith('index.json')) {
      return Promise.resolve(
        // eslint-disable-next-line no-undef
        new Response(storiesJson, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    return originalFetch(url, options);
  };

  if (window && window.fetch) {
    // eslint-disable-next-line no-param-reassign
    window.fetch = mockedFetch;
  }
};

module.exports = handleStoriesFetch;
