---
id: command-line-arguments
title: Command line arguments
---

If you run loki via `yarn` or `npm`, you need to make sure to prepend your argument list with `--` so that yarn passes them though to loki. You can also add `./node_modules/.bin` to your `PATH` to be able to run `loki` directly.

## `loki test`

Capture screenshots and compare them against the reference files.

```bash
yarn loki test -- --port 9009
```

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
| **`--chromeAwsLambdaFunctionName`**     | Name of the use to capture screenshots.                                                                                                         | `loki`                                                    |
| **`--chromeAwsLambdaRetries`**          | The number of retries for invoking the lambda, in case of failure.                                                                              | `0`                                                       |
| **`--chromeConcurrency`**               | How many stories to test in parallel when using chrome                                                                                          | `4`                                                       |
| **`--chromeDockerImage`**               | What docker image to use when running chrome                                                                                                    | `yukinying/chrome-headless-browser-stable:100.0.4896.127` |
| **`--chromeDockerWithoutSeccomp`**      | Run chrome docker without custom seccomp settings.                                                                                              | `false`                                                   |
| **`--chromeDockerUseCopy`**             | Use docker copy instead of volume mount for local stories                                                                                       | `false`                                                   |
| **`--chromeEnableAnimations`**          | Enable CSS transitions and animations.                                                                                                          | `false`                                                   |
| **`--chromeFlags`**                     | Custom chrome flags.                                                                                                                            | `--headless --disable-gpu --hide-scrollbars`              |
| **`--chromeLoadTimeout`**               | How many miliseconds loki will wait for the page to load before taking as screnshot.                                                            | `60000`                                                   |
| **`--chromeRetries`**                   | The number of retries for taking the screenshot, in case of failure.                                                                            | `0`                                                       |
| **`--chromeSelector`**                  | CSS selector to the part of the DOM to screenshot. Useful you have decorators that should be excluded.                                          | `#root > *`                                               |
| **`--chromeTolerance`**                 | How many percent tolerated difference compared to reference image. Behaviour of tolerance depends on `diffingEngine`.                           | `0`                                                       |
| **`--chromeEmulatedMedia`**             | Emulates the given media for CSS media queries. Set to `print` to test print styles.                                                            | _None_                                                    |
| **`--skipStories`**                     | **DEPRECATED** Regular expression for stories that should not be tested, it will be tested against a string with the format `${kind} ${story}`. | _None_                                                    |
| **`--storiesFilter`**                   | Opposite of `--skipStories`.                                                                                                                    | _None_                                                    |
| **`--configurationFilter`**             | Regular expression for targets that should be tested.                                                                                           | _None_                                                    |
| **`--targetFilter`**                    | Regular expression for targets that should be tested.                                                                                           | _None_                                                    |
| **`--requireReference`**                | Fail stories without reference image, useful for CI.                                                                                            | _False, true for CI_                                      |
| **`--verboseRenderer`**                 | Plain text renderer, useful for CI.                                                                                                             | _False, true for CI_                                      |
| **`--silent`**                          | Plain text renderer that will only output errors.                                                                                               | `false`                                                   |
| **`--dockerWithSudo`**                  | Run docker commands with sudo.                                                                                                                  | `false`                                                   |
| **`--dockerNet`**                       | Argument to pass to docker --net, e.g. `host` or `bridge`.                                                                                      | _None_                                                    |

## `loki update`

Capture screenshots and update the reference files.

Takes same arguments as `loki test`.

## `loki approve`

Prunes old and updates reference files with the images generated in the last run.

| Flag              | Description                                       | Default             |
| ----------------- | ------------------------------------------------- | ------------------- |
| **`--reference`** | Path to screenshot reference folder               | `./.loki/reference` |
| **`--output`**    | Path to screenshot output folder                  | `./.loki/current`   |
| **`--diffOnly`**  | Only approve files that failed `loki test` before | `./.loki/current`   |

## `loki init`

```bash
yarn run loki init path/to/storybook -- --force
```

| Flag           | Description                  | Default                    |
| -------------- | ---------------------------- | -------------------------- |
| **`--config`** | Path to storybook folder     | `.storybook` & `storybook` |
| **`--force`**  | Overwrite loki configuration | `false`                    |
