---
id: junit-reporter
title: JUnit Reporter
---

# JUnit Reporter

Loki supports generating JUnit XML reports for test results, which can be integrated with CI/CD systems like Jenkins, CircleCI, GitHub Actions, or any system that understands JUnit XML format.

## Usage

To generate a JUnit XML report while running your visual regression tests, use the `--junitRenderer` flag:

```bash
loki test --junitRenderer
```

By default, this will create a `loki-junit-report.xml` file in your project root.

## Configuration

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--junitRenderer` | Enables JUnit XML report generation | `false` |
| `--junitOutputFile` | Path to the output JUnit XML file | `loki-junit-report.xml` |

Example with custom output file:

```bash
loki test --junitRenderer --junitOutputFile=./reports/loki-results.xml
```

### Configuration in Package.json

You can also configure the JUnit reporter in your `package.json` file:

```json
{
  "loki": {
    "configurations": {
      // your configurations...
    },
    "junitRenderer": true,
    "junitOutputFile": "./test-results/loki-report.xml"
  }
}
```

Or in your `.lokirc`, `.lokirc.json`, or `loki.config.js` file:

```js
// loki.config.js
module.exports = {
  chromeSelector: '.wrapper > *, #root > *, .story-decorator > *',
  // other configurations...
  junitRenderer: true,
  junitOutputFile: "./test-results/loki-report.xml"
};
```

## Output Format

The JUnit XML report includes:

- A test suite named "Loki Visual Tests"
- Individual test cases for each story, grouped by target and configuration
- Test case names derived from story kind and name
- Failure messages for any tests that don't match the reference images

Example output:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="Loki Visual Tests" tests="6" failures="1" errors="0" skipped="0">
    <testcase classname="chrome.docker.chrome.laptop" name="Button - Primary">
    </testcase>
    <testcase classname="chrome.docker.chrome.laptop" name="Button - Secondary">
      <failure message="Visual difference detected">Visual difference detected</failure>
    </testcase>
    <!-- Additional test cases... -->
  </testsuite>
</testsuites>
```

## CI Integration

### Jenkins

For Jenkins, you can use the JUnit plugin to display test results:

```groovy
// Jenkinsfile
pipeline {
  // ...
  stages {
    stage('Visual Regression Tests') {
      steps {
        sh 'npm run loki:test -- --junitRenderer --junitOutputFile=./loki-results.xml'
      }
      post {
        always {
          junit 'loki-results.xml'
        }
      }
    }
  }
}
```

### GitLab CI

For GitLab CI, you can use the JUnit report artifact feature to display test results:

```yaml
# .gitlab-ci.yml
visual-regression-tests:
  stage: test
  image: node:16
  script:
    - npm ci
    - npm run build-storybook
    - npm run loki:test -- --junitRenderer --junitOutputFile=./loki-junit-report.xml
  artifacts:
    when: always
    paths:
      - .loki/difference/
    reports:
      junit: loki-junit-report.xml
```

This configuration will:
- Run your visual tests
- Show test results in the GitLab CI interface under the Tests tab
- Upload difference images as artifacts when tests fail

### GitHub Actions

For GitHub Actions, you can use the built-in support for JUnit reports:

```yaml
# .github/workflows/visual-tests.yml
jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run visual tests
        run: npm run loki:test -- --junitRenderer --junitOutputFile=./loki-results.xml
      - name: Publish Test Report
        uses: mikepenz/action-junit-report@v3
        if: always() # always run even if the previous step fails
        with:
          report_paths: 'loki-results.xml'
```

## Using Multiple Reporters

The JUnit reporter can be used alongside other reporters. For example, you can use both the interactive reporter (default) and the JUnit reporter:

```bash
loki test --junitRenderer
```

This will show the interactive UI in the terminal and also generate the JUnit XML report file. 