---
id: configuration
title: Configuration
---

The init command will add a `loki` section to your `package.json`, but you can edit it to your wishes. _NOTE_: Any command line argument that `loki test` accepts can also be added to the `loki` config object.

Example `package.json`:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "loki": {
    "chromeSelector": "#my-decorator > *",
    "configurations": {
      "chrome.laptop": {
        "target": "chrome.app",
        "width": 1366,
        "height": 768
      },
      "chrome.iphone7": {
        "target": "chrome.docker",
        "preset": "iPhone 7"
      },
      "chrome.a4": {
        "target": "chrome.aws-lambda",
        "preset": "A4 Paper"
      },
      "ios": {
        "target": "ios.simulator"
      },
      "android": {
        "target": "android.emulator"
      }
    }
  }
}
```

You may also use a file named `.lokirc`, `.lokirc.json` or `loki.config.js` if you don't want to pollute your `package.json`.

## `chromeSelector`

This setting is a CSS selector to the part of the page you want screenshots of. This is useful if you have decorators that's not really part of the component itself. Note that it doesn't screenshot the DOM element itself but rather the crops the screenshot to those dimensions, so if you have any elements absolutely positioned above they will be included.

## `diffingEngine`

There are two currently available options to choose from when comparing images in loki. These are both configurable by passing in a JSON block to them with their name in the configuration. This block will be passed through to the library and you can use their specific reference documentation. Example `package.json`:

```json
{
  "loki": {
    "looks-same": {
      "ignoreCaret": true
    }
  }
}
```

### [`gm`](https://github.com/aheckmann/gm)

Uses the GraphicsMagick library to create diffs, this is generally faster but requires to have the library installed. You can install it with homebrew using `brew install graphicsmagick`. This is default if available. `chromeTolerance` percentage is based on overall image, meaning you'd likely want a low threshold.

The configuration is parsed to the `options` argument in `gm.compare`

### [`looks-same`](https://github.com/gemini-testing/looks-same)

A JavaScript only solution that will work out of the box on every machine, however it is slower and will produce a different diff image. `chromeTolerance` percentage is based on neighboring pixels which makes it ideal when you have different pixel densities.

|                | `gm`                                            | `looks-same`                  |
| -------------- | ----------------------------------------------- | ----------------------------- |
| **Dependency** | [GraphicsMagick](http://www.graphicsmagick.org) | None                          |
| **Speed**      | 🏃Fast                                          | 🚶Slower                      |
| **Output**     | ![](/img/gm-diff.png)                           | ![](/img/looks-same-diff.png) |

## `verboseRenderer`

Plain text output, useful for debugging CI.

## ~~`skipStories`~~ **DEPRECATED**

~~This setting is a regular expression matched against the concatenated kind and story name (`${kind} ${story}`), case insensitive. It's useful if some story breaks the tests or contains animations as an alternative to comment it out.~~

This setting is deprecated, use `storiesOf().add.skip()` instead on the stories you want to skip.

## `storiesFilter`

Opposite to `skipStories`.

## `fetchFailIgnore`

The default behaviour of Loki is to fail a test if the story makes a network requests that fails. This setting is a regular expression, if the URL of a failed request matches it, the test will not fail, overriding the default behaviour.

## `fileNameFormatter`

By default loki will produce a flat file structure, but if you want to have hiearchy or make all names lower case you can pass a custom formatter function. It should return a string _without_ an extension and takes an object with these properties: `configurationName, kind, story`.

Since JSON doesn't support functions, you need to be using the `loki.config.js` to configure your project, like so:

```js
module.exports = {
  // ...other config goes here
  fileNameFormatter: ({ configurationName, kind, story }) =>
    `${configurationName}/${kind} ${story}`.toLowerCase(),
};
```

## `configurations`

| Name                                 | Type      | Description                                                                                                                                               | Targets      |
| ------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **`target`**                         | _string_  | Target platform, possible values are `chrome.app`, `chrome.docker`, `chrome.aws-lambda`, `ios.simulator`, `android.emulator`.                             | All          |
| **`skipStories`**                    | _string_  | **DEPRECATED** Same as `loki.skipStories`, but applied to only this configuration.                                                                        | All          |
| **`storiesFilter`**                  | _string_  | Same as `loki.storiesFilter`, but applied to only this configuration.                                                                                     | All          |
| **`chromeSelector`**                 | _string_  | Same as `loki.chromeSelector`, but applied to only this configuration.                                                                                    | `chrome.*`   |
| **`preset`**                         | _string_  | Predefined bundled configuration, possible values are `Retina Macbook Pro 15`, `iPhone 7`, `iPhone 5`, `Google Pixel`, `A4 Paper`, and `US Letter Paper`. | `chrome.*`   |
| **`userAgent`**                      | _string_  | Custom user agent.                                                                                                                                        | `chrome.*`   |
| **`width`**                          | _integer_ | Browser viewport width.                                                                                                                                   | `chrome.*`   |
| **`height`**                         | _integer_ | Browser viewport height.                                                                                                                                  | `chrome.*`   |
| **`disableAutomaticViewportHeight`** | _boolean_ | If the content goes below the viewport do not increase the height so that it fits.                                                                        | `chrome.*`   |
| **`deviceScaleFactor`**              | _integer_ | Browser pixel density multiple, use `2` for retina, not supported in docker.                                                                              | `chrome.app` |
| **`mobile`**                         | _boolean_ | Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more.                                          | `chrome.*`   |
| **`media`**                          | _string_  | Emulates the given media for CSS media queries.                                                                                                           | _None_       |
