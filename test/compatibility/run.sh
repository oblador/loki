#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

fixture=$1
target=$2
mode=${3:-static}
project="$PWD/generated/$fixture"
results="$PWD/results/$fixture-$target-$mode"
rm -rf "$results"
mkdir -p "$results"

storybook_pid=
lambda_container=
cleanup() {
  if [[ -n "$storybook_pid" ]]; then
    kill "$storybook_pid" 2>/dev/null || true
    wait "$storybook_pid" 2>/dev/null || true
  fi
  if [[ -n "$lambda_container" ]]; then
    docker logs "$lambda_container" > "$results/lambda.log" 2>&1 || true
    docker rm -f "$lambda_container" > /dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if [[ "$mode" == dev ]]; then
  (
    cd "$project"
    exec node node_modules/.bin/storybook dev --ci --host 0.0.0.0 --port 6006 --no-open
  ) > "$results/storybook.log" 2>&1 &
  storybook_pid=$!
fi

if [[ "$target" == lambda ]]; then
  lambda_container=$(docker run --rm -d -p 127.0.0.1::8080 \
    --mount "type=bind,src=$project/dist,dst=/var/task/storybook,readonly" \
    example-renderer-aws-lambda:latest)
  lambda_port=$(docker port "$lambda_container" 8080/tcp)
  export LOKI_COMPAT_LAMBDA_URL="http://$lambda_port"
fi

node smoke.js "$fixture" "$target" "$mode"
