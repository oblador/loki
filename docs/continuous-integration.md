---
id: continuous-integration
title: Continuous Integration
---

Loki is built with the intention of running on a continuous integration server, ensuring you don't get any visual regressions in your project. How you run loki on a CI might be different from running locally though. The typical setup will fail stories with missing reference images by passing the `--requireReference` flag and since the CI won't change any of the underlying code, there's no need running storybook in server mode.

A command combining these two could look something like this:

```sh
yarn build-storybook && yarn loki test --requireReference --reactUri file:./storybook-static
```

Commit `.loki/reference` images to Git. When using `chrome.docker`, use the same `chromeDockerImage` locally and in CI.

## GitHub Actions

This example uses Yarn 1, `chrome.docker` configurations, and a `build-storybook` script that writes to `storybook-static`. Save it as `.github/workflows/loki.yml`:

```yaml
name: Visual tests

on: [push, pull_request]

jobs:
  loki:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: yarn install --frozen-lockfile
      - run: yarn build-storybook
      - run: yarn loki test --requireReference --reactUri file:./storybook-static
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: loki-screenshots
          path: .loki
          include-hidden-files: true
```

On failure, download `loki-screenshots` from the workflow run to inspect `.loki/current` and `.loki/difference`.

See the [loki react example project](https://github.com/oblador/loki/tree/master/examples/react) for a reference implementation of this approach.
