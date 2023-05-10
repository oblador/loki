---
id: serverless
title: Serverless renderer
---

If you have a very large test suite, running them on a single machine might be time consuming even with the parallelization built into loki. For these use cases you can use a remote renderer; for the time being only AWS Lambda is supported, but Google Cloud Functions is on the roadmap.

## Prerequisites

This guide assumes that you have the [AWS command line tools](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) installed/configured and have a basic understanding of access management in AWS.

## Lambda renderer setup

First you need to create the lambda that will render your stories. For the simplest use case you can copy-paste the [`examples/renderer-aws-lambda`](https://github.com/oblador/loki/tree/master/examples/renderer-aws-lambda):

### 1. Create a new project

```sh
mkdir loki-lambda-renderer
cd loki-lambda-renderer
yarn init -y
```

### 2. Add loki renderer and Chrome binary

```sh
yarn add @loki/renderer-aws-lambda chrome-aws-lambda
```

### 3. Expose loki in lambda handler

```js
const { createChromeAWSLambdaRenderer } = require('@loki/renderer-aws-lambda');

module.exports = {
  handler: createChromeAWSLambdaRenderer(),
};
```

In this step you might add any pre-processing that you like, for example you might want to cache the storybook build to disk for faster executions or have some kind of locking mechanism.

## Deploy

### 1. Create a zip

```sh
yarn --production
zip -r loki-lambda-renderer.zip .
```

### 2. Create an appropriate role

Your lambda must have a role assigned, for the simplest use case you can have it locked down to not access anything:

```sh
aws iam create-role \
  --role-name lambda-role.loki \
  --assume-role-policy-document "arn:aws:iam::aws:policy/AWSDenyAll"
```

### 3. Deploy the zip

```sh
aws lambda create-function \
 --function-name loki \
 --runtime nodejs16.x \
 --role arn:aws:iam::<your role> \
 --handler index.handler \
 --memory-size 2048 \
 --timeout 120 \
 --zip-file fileb://loki-lambda-renderer.zip
```

## Run tests

### 1. Add lambda configuration

In the `loki` section of `package.json` in your main project, add an appropriate configuration with `target` set to `chrome.aws-lambda`:

```json
{
  "loki": {
    "configurations": {
      "chrome.iphone7": {
        "target": "chrome.aws-lambda",
        "preset": "iPhone 7"
      }
    }
  }
}
```

### 2. Upload storybook build

Since the lambda cannot access your local file system, you must make the storybook build available in some way. Easiest way is to simply upload it to S3 and access it over HTTPS.

### 3. Run tests

Unlike the CLI, the AWS SDK won't read your configuration file by default, so make sure to either pass `AWS_REGION=<your region>` manually or `AWS_SDK_LOAD_CONFIG=true`:

```sh
AWS_SDK_LOAD_CONFIG=true yarn loki test --reactUri https://url.to/your/storybook-static/
```
