<img src="https://user-images.githubusercontent.com/378279/27998811-43b9906e-6515-11e7-835a-6f596506cc46.png" width="300" height="130" alt="Loki" />

# Visual Regression Testing for Storybook

## Prerequsites

* Node 7.6 or higher
* Either docker or Chrome 59+

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

### loki init

```
yarn run loki init path/to/storybook -- --force
```

|flag|alias|description|default|
|---|---|---|---|
|**--config**|-c|Path to storybook folder|`.storybook` & `storybook`|
|**--force**|-f|Overwrite loki configuration|`false`|

## License

[MIT License](http://opensource.org/licenses/mit-license.html). © Joel Arvidsson 2017
