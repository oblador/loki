---
id: continuous-integration
title: Continuous Integration
---

Loki is built with the intention of running on a continuous integration server, ensuring you don't get any visual regressions in your project. How you run loki on a CI might be different from running locally though. The typical setup will fail stories with missing reference images by passing the `--requireReference` flag and since the CI won't change any of the underlying code, there's no need running storybook in server mode.

A command combining these two could look something like this:

```
build-storybook && loki --requireReference --reactUri file:./storybook-static
```

See the [loki react example project](https://github.com/oblador/loki/tree/master/examples/react) for a reference implementation of this approach.

## JUnit Reporting

For better integration with CI/CD systems, Loki supports generating JUnit XML reports of test results. This is particularly useful for visualizing test results in CI systems like Jenkins, CircleCI, or GitHub Actions.

To enable JUnit reporting, add the `--junitRenderer` flag:

```
build-storybook && loki --requireReference --reactUri file:./storybook-static --junitRenderer --junitOutputFile=./test-results/loki-report.xml
```

For more details about the JUnit reporter, see the [JUnit Reporter](junit-reporter.md) documentation.
