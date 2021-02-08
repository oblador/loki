<img src="https://user-images.githubusercontent.com/378279/27998811-43b9906e-6515-11e7-835a-6f596506cc46.png" width="300" height="130" alt="Loki" />

# Visual Regression Testing for Storybook

[![GitHub license](https://img.shields.io/npm/l/loki.svg)](https://github.com/oblador/loki/blob/master/LICENSE) [![Tests](https://github.com/oblador/loki/workflows/Tests/badge.svg)](https://github.com/oblador/loki/actions?query=workflow%3ATests) [![npm version](https://img.shields.io/npm/v/loki.svg)](https://npmjs.com/package/loki) [![npm downloads](https://img.shields.io/npm/dm/loki.svg)](https://npmjs.com/package/loki)

<img src="https://user-images.githubusercontent.com/378279/28074070-f0052fac-6657-11e7-8a9d-398a12d2d6a8.png" width="672" height="494" alt="Loki" />

## Rationale

There are a few visual regression tools for the web, but most either cannot be run headless or use phantomjs which is deprecated and a browser nobody is _actually_ using. They usually also require you to maintain fixtures. With react-native it's now possible to target multiple platforms with a single code base, but there's no single tool to test all to my knowledge.

Loki aims to have easy setup, no to low maintenance cost, reproducible tests independent of which OS they are run on, runnable on CI and support all platforms storybook does.

## Supported platforms

- Chrome in docker (recommended)
- Chrome in AWS Lambda
- Local Chrome application
- iOS simulator
- Android emulator

## Prerequisites

- [Node](https://nodejs.org/)

### Optional dependencies

- [GraphicsMagick](http://www.graphicsmagick.org) for gm diffing engine, `brew install graphicsmagick`
- [Docker](https://www.docker.com/community-edition#/download) for the `chrome.docker` target.
- [Chrome 59+](https://www.google.se/chrome/browser/desktop/) for the `chrome.app` target, `brew cask install google-chrome-canary`.

## Installation

```
yarn add loki --dev
yarn loki init
```

## Workflow

Loki will not start any servers for you, so ensure storybook and any simulator/emulator is up and running before running tests.

1.  Start storybook server
    `yarn storybook`
2.  Add first set of reference files
    `yarn loki update`
3.  Do some changes to your components
4.  Test against references
    `yarn loki test`
5.  Review changes in diff folder
6.  Approve changes and update references
    `yarn loki approve`

## Documentation

- [Introduction](https://loki.js.org/)
- [Getting started](https://loki.js.org/getting-started.html)
- [Configuration](https://loki.js.org/configuration.html)
- [Command line arguments](https://loki.js.org/command-line-arguments.html)

## Examples

- [React example](https://github.com/oblador/loki/tree/master/examples/react)
- [React Native example](https://github.com/oblador/loki/tree/master/examples/react-native)

## Development

```bash
# Install dependencies
yarn
# Start example storybook
yarn workspace @loki/example-react run storybook
# Run example visual tests
yarn workspace @loki/example-react run test
# Run unit tests
yarn test
# Run cli integration tests
cd test/cli && yarn test
```

## Maintainers

<table>
  <tbody>
    <tr>
      <td align="center">
        <a href="https://github.com/oblador">
          <img width="150" height="150" src="https://github.com/oblador.png?v=3&s=150">
          <br />
          <strong>Joel Arvidsson</strong>
        </a>
        <br />
        Author
      </td>
      <td align="center">
        <a href="https://github.com/techeverri">
          <img width="150" height="150" src="https://github.com/techeverri.png?v=3&s=150">
          <br />
          <strong>Tomas Echeverri Valencia</strong>
        </a>
        <br />
        Maintainer
      </td>
    </tr>
  <tbody>
</table>

## License

[MIT License](http://opensource.org/licenses/mit-license.html). © Joel Arvidsson 2017-present
