---
id: serverless
title: Serverless renderer
---

If you have a very large test suite, running them on a single machine might be time consuming even with the parallelization built into loki. For these use cases you can use a remote renderer; for the time being only AWS Lambda is supported, but Google Cloud Functions is on the roadmap.

## Prerequisites

This guide assumes that you have the [AWS command line tools](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) installed/configured and have a basic understanding of access management in AWS.

For the example below, you also need Node.js 22, Yarn 1, `zip`, and an S3 bucket in your configured AWS Region.

## Lambda renderer setup

First you need to create the lambda that will render your stories. This example bundles Chromium with the function and uses Node.js 22 on `x86_64`, Loki renderer `0.35.0`, and Chromium `148.0.0`.

### 1. Create a new project

```sh
mkdir loki-lambda-renderer
cd loki-lambda-renderer
yarn init -y
```

### 2. Add loki renderer and Chrome binary

```sh
yarn add --exact @loki/renderer-aws-lambda@0.35.0 @sparticuz/chromium@148.0.0
```

### 3. Expose loki in lambda handler

Save this as `index.js`:

```js
const { createChromeAWSLambdaRenderer } = require('@loki/renderer-aws-lambda');

module.exports = {
  handler: createChromeAWSLambdaRenderer(),
};
```

In this step you might add any pre-processing that you like, for example you might want to cache the storybook build to disk for faster executions or have some kind of locking mechanism.

## Test locally

Run the handler in Lambda's Node.js 22 image using Docker:

```sh
docker run --rm --platform linux/amd64 \
  -p 127.0.0.1:9000:8080 \
  -e AWS_EXECUTION_ENV=AWS_Lambda_nodejs22.x \
  --mount "type=bind,src=$PWD,dst=/var/task,readonly" \
  public.ecr.aws/lambda/nodejs:22 index.handler
```

In another terminal, invoke it with a hosted Storybook build's URL:

```sh
curl --fail-with-body \
  -H 'Content-Type: application/json' \
  --data '{"command":"getStorybook","baseUrl":"https://url.to/your/storybook-static/"}' \
  http://localhost:9000/2015-03-31/functions/function/invocations
```

## Deploy

### 1. Create a zip

```sh
yarn install --production --frozen-lockfile
zip -qr loki-lambda-renderer.zip index.js package.json node_modules
```

### 2. Create an appropriate role

Your lambda must have a role assigned. The trust policy below allows Lambda to assume the role, and the attached policy allows it to write logs:

```sh
cat > trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

LOKI_ROLE_ARN=$(aws iam create-role \
  --role-name lambda-role.loki \
  --assume-role-policy-document file://trust-policy.json \
  --query 'Role.Arn' --output text)

aws iam attach-role-policy \
  --role-name lambda-role.loki \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### 3. Deploy the zip

Set `LOKI_BUCKET` to your deployment bucket. This example's bundled Chromium package exceeds Lambda's [50 MB direct-upload limit](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html), so upload it through S3:

```sh
LOKI_BUCKET=your-deployment-bucket
aws s3 cp loki-lambda-renderer.zip "s3://$LOKI_BUCKET/loki-lambda-renderer.zip"

aws lambda create-function \
  --function-name loki \
  --runtime nodejs22.x \
  --architectures x86_64 \
  --role "$LOKI_ROLE_ARN" \
  --handler index.handler \
  --memory-size 2048 \
  --timeout 120 \
  --code "S3Bucket=$LOKI_BUCKET,S3Key=loki-lambda-renderer.zip"
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

The credentials running Loki need `lambda:InvokeFunction` permission for the `loki` function.

Unlike the CLI, the AWS SDK won't read your configuration file by default, so make sure to either pass `AWS_REGION=<your region>` manually or `AWS_SDK_LOAD_CONFIG=true`:

```sh
AWS_SDK_LOAD_CONFIG=true yarn loki test --reactUri https://url.to/your/storybook-static/
```
