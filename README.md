<img src="https://user-images.githubusercontent.com/378279/27998811-43b9906e-6515-11e7-835a-6f596506cc46.png" width="300" height="130" alt="Loki" />

# Visual Regression Testing for Storybook

<img src="https://user-images.githubusercontent.com/378279/28074070-f0052fac-6657-11e7-8a9d-398a12d2d6a8.png" width="672" height="494" alt="Loki" />

## Rationale

There's a few visual regression tools for the web, but most use phantomjs which is deprecated and a browser nobody is _actually_ using, and they usually require you to maintain fixtures. Also with react-native it's now possible to target multiple platforms with a single code base and there's no tool supporting all to my knowledge.

## Supported platforms

* Chrome
  * Local computer
  * Docker
* iOS simulator
* Android emulator

## Prerequsites

* Node 7.6 or higher
* Either docker or Chrome 59+
* Optionally [GraphicsMagick](http://www.graphicsmagick.org)

## Installation

```
yarn add loki --dev
yarn run loki init
```

## Configuration

The init command will add a `loki` section to your `package.json`, but you can edit it to your wishes. 

Example `package.json`: 

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "loki": {
    "chrome-selector": "#my-decorator > *",
    "configurations": {
      "chrome.laptop": {
        "target": "chrome.app",
        "width": 1366,
        "height": 768
      },
      "chrome.iphone7": {
        "skip-stories": "loading|MyFailingComponent",
        "target": "chrome.app",
        "preset": "iPhone 7"
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

### `chrome-selector`

Similar to the `--chrome-selector` CLI argument, this setting is a CSS selector to the part of the page you want screenshots of. This is useful if you have decorators that's not really part of the component itself. Note that it doesn't screenshot the DOM element itself but rather the crops the screenshot to those dimensions, so if you have any elements absolutely positioned above they will be included.

### `skip-stories`

Similar to the `--skip-stories` CLI argument, this setting is a regular expression matched against the concatenated kind and story name (`${kind} ${story}`), case insensitive. It's useful if some story breaks the tests or contains animations as an alternative to comment it out. 

### `filter-stories`

Opposite to `skip-stories`. 

### `configurations`

|Name|Type|Description|Targets|
|---|---|---|---|
|**`target`**|*string*|Target platform, possible values are `chrome.app`, `chrome.docker`, `ios.simulator`, `android.emulator`.|All|
|**`skip-stories`**|*string*|Same as `loki.skip-stories`, but applied to only this configuration.|All|
|**`filter-stories`**|*string*|Same as `loki.filter-stories`, but applied to only this configuration.|All|
|**`chrome-selector`**|*string*|Same as `loki.chrome-selector`, but applied to only this configuration.|`chrome.*`|
|**`preset`**|*string*|Predefined bundled configuration, possible values are `Retina Macbook Pro 15`, `iPhone 7`, `iPhone 5` and `Google Pixel`.|`chrome.*`|
|**`userAgent`**|*string*|Custom user agent.|`chrome.*`|
|**`width`**|*integer*|Browser viewport width.|`chrome.*`|
|**`height`**|*integer*|Browser viewport height.|`chrome.*`|
|**`deviceScaleFactor`**|*integer*|Browser pixel density multiple, use `2` for retina, not supported in docker.|`chrome.app`|
|**`mobile`**|*boolean*|Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more.|`chrome.*`|
|**`fitWindow`**|*boolean*|Whether a view that exceeds the available browser window area should be scaled down to fit.|`chrome.*`|


## Running visual tests

Make sure your storybook server is running, and any simulator/emulator if you target them, before running this command.

```
yarn run storybook
yarn run loki
```

## Commands

### loki test

```
yarn run loki test -- --port 9009
```

If you run loki via `yarn`, you need to make sure to prepend your argument list with `--` so that yarn passes them though to loki. You can add `./node_modules/.bin` to your `PATH` to be able to run `loki` directly too. 

|Flag|Description|Default|
|---|---|---|
|**`--host`**|Storybook host|`localhost`|
|**`--port`**|Storybook port|*None*|
|**`--react-port`**|React Storybook port|`6006`|
|**`--react-native-port`**|React Native Storybook port|`7007`|
|**`--reference`**|Path to screenshot reference folder|`./screenshots/reference`|
|**`--output`**|Path to screenshot output folder|`./screenshots/current`|
|**`--difference`**|Path to image diff folder|`${outputFolder}/diff`|
|**`--diffing-engine`**|What diffing engine to use, currently supported are `looks-same` and `gm`|`looks-same`|
|**`--chrome-concurrency`**|How many stories to test in paralell when using chrome|`4`|
|**`--chrome-flags`**|Custom chrome flags.|`--headless --disable-gpu --hide-scrollbars`|
|**`--chrome-load-timeout`**|How many miliseconds loki will wait for the page to load before taking as screnshot.|`60000`|
|**`--chrome-selector`**|CSS selector to the part of the DOM to screenshot. Useful you have decorators that should be excluded.|`#root > *`|
|**`--chrome-tolerance`**|How many percent tolerated difference compared to reference image.|`2.3`|
|**`--skip-stories`**|Regular expression for stories that should not be tested, it will be tested against a string with the format `${kind} ${story}`.|*None*|
|**`--stories-filter`**|Opposite of `--skip-stories`.|*None*|
|**`--configuration-filter`**|Regular expression for targets that should be tested.|*None*|
|**`--target-filter`**|Regular expression for targets that should be tested.|*None*|
|**`--update-reference`**|Update reference files instead of testing.|*No*|
|**`--require-reference`**|Fail stories without reference image, useful for CI.|*No*|

### loki init

```
yarn run loki init path/to/storybook -- --force
```

|Flag|Description|Default|
|---|---|---|
|**`--config`**|Path to storybook folder|`.storybook` & `storybook`|
|**`--force`**|Overwrite loki configuration|`false`|

## License

[MIT License](http://opensource.org/licenses/mit-license.html). © Joel Arvidsson 2017
