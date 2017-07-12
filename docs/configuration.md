# Configuration

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

## `chrome-selector`

Similar to the `--chrome-selector` CLI argument, this setting is a CSS selector to the part of the page you want screenshots of. This is useful if you have decorators that's not really part of the component itself. Note that it doesn't screenshot the DOM element itself but rather the crops the screenshot to those dimensions, so if you have any elements absolutely positioned above they will be included.

## `skip-stories`

Similar to the `--skip-stories` CLI argument, this setting is a regular expression matched against the concatenated kind and story name (`${kind} ${story}`), case insensitive. It's useful if some story breaks the tests or contains animations as an alternative to comment it out. 

## `filter-stories`

Opposite to `skip-stories`. 

## `configurations`

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
