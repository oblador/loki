---
id: command-line-arguments
title: Command line arguments
---

If you run loki via an `npm` script, you need to prepend your argument list with `--`, for example `npm run loki -- test --port 9009`. Yarn passes arguments directly to `yarn loki`. You can also add `./node_modules/.bin` to your `PATH` to be able to run `loki` directly.

## `loki test`

Capture screenshots and compare them against the reference files.

```bash
yarn loki test --port 9009
```

To select configurations by name, pass a regular expression as a positional argument, for example `yarn loki test '^chrome_'`. This is equivalent to `--configurationFilter '^chrome_'`.

| Flag                                    | Description                                                                                                                                     | Default                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **`--host`**                            | Storybook host                                                                                                                                  | `localhost`                                               |
| **`--port`**                            | Storybook port                                                                                                                                  | _None_                                                    |
| **`--reactUri`**                        | URI to base of React Storybook. For static build use `file:./storybook-static`.                                                                 | _None_                                                    |
| **`--reactPort`**                       | React Storybook port                                                                                                                            | `6006`                                                    |
| **`--reactNativePort`**                 | React Native Storybook port                                                                                                                     | `7007`                                                    |
| **`--reference`**                       | Path to screenshot reference folder                                                                                                             | `./.loki/reference`                                       |
| **`--output`**                          | Path to screenshot output folder                                                                                                                | `./.loki/current`                                         |
| **`--difference`**                      | Path to image diff folder                                                                                                                       | `./.loki/difference`                                      |
| **`--diffingEngine`**                   | What diffing engine to use, currently supported are `pixelmatch`, `looks-same` and `gm`                                                         | `pixelmatch`                                              |
| **`--chromeAwsLambdaBatchSize`**        | Number of stories to test per lambda invocation.                                                                                                | `1`                                                       |
| **`--chromeAwsLambdaBatchConcurrency`** | Number of stories to test in parallel per lambda invocation.                                                                                    | `1`                                                       |
| **`--chromeAwsLambdaFunctionName`**     | Name of the Lambda function used to capture screenshots.                                                                                        | `loki`                                                    |
| **`--chromeAwsLambdaRetries`**          | The number of retries for invoking the lambda, in case of failure.                                                                              | `0`                                                       |
| **`--chromeConcurrency`**               | How many stories to test in parallel when using chrome                                                                                          | `4`                                                       |
| **`--chromeDockerImage`**               | What docker image to use when running chrome                                                                                                    | `yukinying/chrome-headless-browser-stable:118.0.5993.117` |
| **`--chromeDockerWithoutSeccomp`**      | Run chrome docker without unconfined seccomp settings.                                                                                          | `false`                                                   |
| **`--chromeEnableAnimations`**          | Enable CSS transitions and animations.                                                                                                          | `false`                                                   |
| **`--chromeFlags`**                     | Custom chrome flags.                                                                                                                            | `--headless --disable-gpu --hide-scrollbars`              |
| **`--chromeLoadTimeout`**               | How many milliseconds loki will wait for the page to load before taking as screenshot.                                                          | `60000`                                                   |
| **`--chromeRetries`**                   | The number of retries for taking the screenshot, in case of failure.                                                                            | `0`                                                       |
| **`--chromeSelector`**                  | CSS selector to the part of the DOM to screenshot. Useful if you have decorators that should be excluded.                                       | `#root > *, #storybook-root > *`                          |
| **`--chromeTolerance`**                 | Image comparison tolerance; meaning depends on the [diffing engine](configuration.md#diffingengine).                                            | `0`                                                       |
| **`--chromeEmulatedMedia`**             | Emulates the given media for CSS media queries. Set to `print` to test print styles.                                                            | _None_                                                    |
| **`--skipStories`**                     | **DEPRECATED** Regular expression for stories that should not be tested, it will be tested against a string with the format `${kind} ${story}`. | _None_                                                    |
| **`--storiesFilter`**                   | Case-insensitive regular expression matched against `${kind} ${story}`.                                                                         | _None_                                                    |
| **`--configurationFilter`**             | Regular expression matched against configuration names.                                                                                         | _None_                                                    |
| **`--targetFilter`**                    | Regular expression matched against target types, e.g. `chrome.docker`.                                                                          | _None_                                                    |
| **`--fetchFailIgnore`**                 | Regular expression matching failed request URLs to ignore in Chrome (case insensitive).                                                         | _None_                                                    |
| **`--requireReference`**                | Fail stories without reference image, useful for CI.                                                                                            | _False, true for CI_                                      |
| **`--passWithNoStories`**               | If no stories are detected consider this a success.                                                                                             | _False_                                                   |
| **`--verboseRenderer`**                 | Plain text renderer, useful for CI.                                                                                                             | `false`                                                   |
| **`--silent`**                          | Plain text renderer that will only output errors.                                                                                               | `false`                                                   |
| **`--dockerWithSudo`**                  | Run docker commands with sudo.                                                                                                                  | `false`                                                   |
| **`--dockerNet`**                       | Argument to pass to docker --net, e.g. `host` or `bridge`.                                                                                      | _None_                                                    |
| **`--device`**                          | Device/emulator ID to target for screenshots. Useful when running multiple devices on a single machine.                                         | _None_                                                    |

Pass diff-engine options using dotted flags, such as `--pixelmatch.threshold 0.2`, `--looks-same.tolerance 2` or `--gm.tolerance 0.01`. See [diffing engines](configuration.md#diffingengine) for engine details and links to their options.

## `loki update`

Capture screenshots and update the reference files.

Takes same arguments as `loki test`.

## `loki approve`

Prunes old and updates reference files with the images generated in the last run.

| Flag               | Description                                       | Default              |
| ------------------ | ------------------------------------------------- | -------------------- |
| **`--reference`**  | Path to screenshot reference folder               | `./.loki/reference`  |
| **`--output`**     | Path to screenshot output folder                  | `./.loki/current`    |
| **`--difference`** | Path to image diff folder used by `--diffOnly`    | `./.loki/difference` |
| **`--diffOnly`**   | Only approve files that failed `loki test` before | false                |

## `loki init`

```bash
yarn loki init path/to/storybook --force
```

Pass the Storybook directory as a positional argument or with `--config`. Here, `--config` selects the Storybook directory, not a Loki configuration file.

| Flag                 | Description                  | Default                                          |
| -------------------- | ---------------------------- | ------------------------------------------------ |
| **`--config`, `-c`** | Path to Storybook folder     | `.storybook` (React), `storybook` (React Native) |
| **`--force`, `-f`**  | Overwrite loki configuration | `false`                                          |
