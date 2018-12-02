# Continuous Integration

Loki is built with the intention of running on a continuous integration server, ensuring you don't get any visual regressions in your project. How you run loki on a CI might be different from running locally though. The typical setup will fail stories with missing reference images by passing the `--requireReference` flag and since the CI won't change any of the underlying code, there's no need running storybook in server mode. 

A command combining these two could look something like this: 

```
build-storybook && loki --requireReference --reactUri file:./storybook-static
```

See the [loki react example project](https://github.com/oblador/loki/tree/master/examples/react) for a reference implementation of this approach. 

## Using Docker

Some CIs like e. g. [CircleCI](http://circleci.com/) run the code in a Docker container already, so setting up a Chrome headless docker container inside the container isn't a viable solution. Instead it is possible to spin up a headless-chrome container in the CI and connect it to the test.
To do this you can run loki with `--chromeDockerUseExisting`. This way loki will look for an already running container at `localhost:9222` (or any other location you specify via `--chromeDockerHost` and `--chromeDockerHost`). We recommend to use the exact same image for headless chrome on your CI that you use for local testing to avoid discrepancies in rendering.
