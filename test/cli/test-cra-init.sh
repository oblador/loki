#!/bin/bash

set -Eeuo pipefail

assert_contains() {
  FILENAME=$1
  EXPECTED_CONTENT=$2

  if [[ "$(cat $FILENAME)" == *"${EXPECTED_CONTENT}"* ]]; then
    return 0
  else
    echo "Unable to find $EXPECTED_CONTENT in $FILENAME"
    return 1
  fi
}

# Ensure we're in the correct folder
pushd "$( dirname "${BASH_SOURCE[0]}" )" > /dev/null

# Scaffold a new CRA project with storybook and loki
mkdir -p generated
cd generated
rm -rf create-react-app || true
yarn create react-app create-react-app --template cra-template@1.1.2
cd create-react-app
CI=true npx --yes storybook@8.6.14 init --yes --no-dev
../../../../node_modules/.bin/loki init

# Ensure modifications has been made
assert_contains "package.json" "$(cat <<-END
  "loki": {
    "configurations": {
      "chrome.laptop": {
        "target": "chrome.docker",
        "width": 1366,
        "height": 768,
        "deviceScaleFactor": 1,
        "mobile": false
      },
      "chrome.iphone7": {
        "target": "chrome.docker",
        "preset": "iPhone 7"
      }
    }
  }
END
)"

# Ensure we can snap stories
yarn build-storybook --quiet
mkdir -p .loki/reference
cp ../../fixtures/chrome_laptop_Example_Button_Primary.png ./.loki/reference

yarn storybook --no-open 2> error.log > output.log &
STORYBOOK_PID=$!

../../../../node_modules/.bin/loki test laptop --requireReference --storiesFilter '^Example/Button Primary$' --reactUri http://localhost:6006

kill $STORYBOOK_PID

# Peace out
popd > /dev/null
