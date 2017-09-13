# Configuration

The init command will add a `loki` section to your `package.json`, but you can edit it to your wishes. *NOTE*: Any command line argument that `loki test` accepts can also be added to the `loki` config object.

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
        "skipStories": "loading|MyFailingComponent",
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

## `chromeSelector`

This setting is a CSS selector to the part of the page you want screenshots of. This is useful if you have decorators that's not really part of the component itself. Note that it doesn't screenshot the DOM element itself but rather the crops the screenshot to those dimensions, so if you have any elements absolutely positioned above they will be included.

## `diffingEngine`

There are two currently available options to choose from when comparing images in loki: 

### `gm`

Uses the GraphicsMagick library to create diffs, this is generally faster but requires to have the library installed. You can install it with homebrew using `brew install graphicsmagick`. This is default if available.

### `looks-same`

A JavaScript only solution that will work out of the box on every machine, however it is slower and will produce a different diff image. 

||`gm`|`looks-same`|
|-|---|------------|
|**Dependency**|[GraphicsMagick](http://www.graphicsmagick.org)|None| 
|**Speed**|🏃Fast|🚶Slower| 
|**Output**|![](gm-diff.png)|![](looks-same-diff.png)| 

## `skipStories`

This setting is a regular expression matched against the concatenated kind and story name (`${kind} ${story}`), case insensitive. It's useful if some story breaks the tests or contains animations as an alternative to comment it out. 

## `storiesFilter`

Opposite to `skipStories`. 

## `configurations`

|Name|Type|Description|Targets|
|---|---|---|---|
|**`target`**|*string*|Target platform, possible values are `chrome.app`, `chrome.docker`, `ios.simulator`, `android.emulator`.|All|
|**`skipStories`**|*string*|Same as `loki.skipStories`, but applied to only this configuration.|All|
|**`storiesFilter`**|*string*|Same as `loki.storiesFilter`, but applied to only this configuration.|All|
|**`chromeSelector`**|*string*|Same as `loki.chromeSelector`, but applied to only this configuration.|`chrome.*`|
|**`preset`**|*string*|Predefined bundled configuration, possible values are `Retina Macbook Pro 15`, `iPhone 7`, `iPhone 5` and `Google Pixel`.|`chrome.*`|
|**`userAgent`**|*string*|Custom user agent.|`chrome.*`|
|**`width`**|*integer*|Browser viewport width.|`chrome.*`|
|**`height`**|*integer*|Browser viewport height.|`chrome.*`|
|**`deviceScaleFactor`**|*integer*|Browser pixel density multiple, use `2` for retina, not supported in docker.|`chrome.app`|
|**`mobile`**|*boolean*|Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text autosizing and more.|`chrome.*`|
|**`fitWindow`**|*boolean*|Whether a view that exceeds the available browser window area should be scaled down to fit.|`chrome.*`|
