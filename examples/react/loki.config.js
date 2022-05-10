module.exports = {
  chromeSelector: '.wrapper > *, #root > *, .story-decorator > *',
  diffingEngine: 'pixelmatch',
  configurations: {
    'chrome.laptop': {
      target: 'chrome.docker',
      width: 1366,
      height: 768,
    },
    'chrome.iphone7': {
      target: 'chrome.docker',
      preset: 'iPhone 7',
    },
    'chrome.a4': {
      target: 'chrome.docker',
      preset: 'A4 Paper',
    },
  },
  fetchFailIgnore: 'localhost:1234/get',
};
