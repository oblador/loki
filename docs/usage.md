# Usage

If you run loki via `yarn`, you need to make sure to prepend your argument list with `--` so that yarn passes them though to loki. You can add `./node_modules/.bin` to your `PATH` to be able to run `loki` directly too. 

## `loki test`

Capture screenshots and compare them against the reference files. 

```
yarn loki test -- --port 9009
```

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
|**`--require-reference`**|Fail stories without reference image, useful for CI.|*No*|

## `loki update`

Capture screenshots and update the reference files. 

Takes same arguments as `loki test`.

## `loki init`

```
yarn run loki init path/to/storybook -- --force
```

|Flag|Description|Default|
|---|---|---|
|**`--config`**|Path to storybook folder|`.storybook` & `storybook`|
|**`--force`**|Overwrite loki configuration|`false`|
