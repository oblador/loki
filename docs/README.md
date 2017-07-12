<img src="https://user-images.githubusercontent.com/378279/27998811-43b9906e-6515-11e7-835a-6f596506cc46.png" width="300" height="130" class="center" alt="Loki" />

<h1 class="center">Visual Regression Testing for Storybook</h1>

<img src="https://user-images.githubusercontent.com/378279/28074070-f0052fac-6657-11e7-8a9d-398a12d2d6a8.png" width="672" height="494" class="center" alt="" />

## Rationale

There's a few visual regression tools for the web, but most use phantomjs which is deprecated and a browser nobody is _actually_ using, and they usually require you to maintain fixtures. Also with react-native it's now possible to target multiple platforms with a single code base and there's no tool supporting all to my knowledge.

## Supported platforms

* Chrome
  * Local computer
  * Docker
* iOS simulator
* Android emulator

## Workflow

Loki will not start any servers for you, so ensure storybook and any simulator/emulator is up and running before running tests.

1.  Start storybook server
    `yarn storybook`
2.  Add first set of reference files
    `yarn loki update`
3.  Do some changes to your components
4.  Test against references
    `yarn loki test`
4.  Review changes in diff folder
5.  Approve changes and update references
    `yarn loki update`
