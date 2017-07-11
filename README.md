<img src="https://user-images.githubusercontent.com/378279/27998811-43b9906e-6515-11e7-835a-6f596506cc46.png" width="300" height="130" alt="Loki" />

# Visual Regression Testing for Storybook

<img src="https://user-images.githubusercontent.com/378279/28074070-f0052fac-6657-11e7-8a9d-398a12d2d6a8.png" width="672" height="494" alt="Loki" />

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
yarn add loki
yarn run loki init
```

## Running visual tests

```
yarn run loki
```

## Commands

### loki test

Make sure your storybook server is running, and any simulator/emulator if you target them, before running this command.

```
yarn run loki test -- --port 9009
```

|Flag|Description|Default|
|---|---|---|---|
|**`--host`**|Storybook host|`localhost`|
|**`--port`**|Storybook port|*None*|
|**`--react-port`**|React Storybook port|`6006`|
|**`--react-native-port`**|React Native Storybook port|`7007`|
|**`--reference`**|Path to screenshot reference folder|`./screenshots/reference`|
|**`--output`**|Path to screenshot output folder|`./screenshots/current`|
|**`--difference`**|Path to image diff folder|`${outputFolder}/diff`|
|**`--diffing-engine`**|What diffing engine to use, currently supported are `looks-same` and `gm`|`looks-same`|
|**`--chrome-concurrency`**|How many stories to test in paralell when using chrome|`4`|
|**`--chrome-selector`**|CSS selector to the part of the DOM to screenshot. Useful you have decorators that should be excluded.|`#root > *`|
|**`--chrome-flags`**|Custom chrome flags.|`--headless --disable-gpu --hide-scrollbars`|
|**`--skip-stories`**|Regular expression for stories that should not be tested.|*None*|
|**`--configuration-filter`**|Regular expression for targets that should be tested.|*None*|
|**`--target-filter`**|Regular expression for targets that should be tested.|*None*|

### loki init

```
yarn run loki init path/to/storybook -- --force
```

|Flag|Description|Default|
|---|---|---|---|
|**`--config`**|Path to storybook folder|`.storybook` & `storybook`|
|**`--force`**|Overwrite loki configuration|`false`|

## License

[MIT License](http://opensource.org/licenses/mit-license.html). © Joel Arvidsson 2017
