module.exports = {
  chromeSelector: '.wrapper > *, #root > *, .story-decorator > *',
  diffingEngine: 'pixelmatch',
  configurations: {
    'chrome.laptop': {
      target: 'chrome.docker',
      width: 1366,
      height: 768,
    },
    'chrome.laptop.dark': {
      target: 'chrome.docker',
      width: 1366,
      height: 768,
      features: [{ name: 'prefers-color-scheme', value: 'dark' }],
    },
    'chrome.iphone7': {
      target: 'chrome.docker',
      preset: 'iPhone 7',
    },
    'chrome.iphone7.dark': {
      target: 'chrome.docker',
      preset: 'iPhone 7 Dark Mode',
    },
    'chrome.a4': {
      target: 'chrome.docker',
      preset: 'A4 Paper',
    },
  },
  fetchFailIgnore: 'localhost:1234/get',
};
