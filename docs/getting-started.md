# Getting started

## Prerequsites

* Node 7.6 or higher

### Optional dependencies
* [GraphicsMagick](http://www.graphicsmagick.org) for gm diffing engine, `brew install graphicsmagick`
* [Docker](https://www.docker.com/community-edition#/download) for the `chrome.docker` target.
* [Chrome 59+](https://www.google.se/chrome/browser/desktop/) for the `chrome.app` target, `brew cask install google-chrome-canary`. 
* [react-native-devsettings-android](https://github.com/jhen0409/react-native-devsettings-android) for self-healing crashes on android. 

## Installation

```
yarn add loki --dev
yarn loki init
```

## Running your first tests

### 1. Review configuration

The `loki init` command will detect what type of project it is and add default configurations to your `package.json` file under the key `loki`. For web this is testing laptop and iPhone configurations using local Chrome app. You can change this at any time. 

### 2. Start Storybook

For loki to be able to access your stories you must start the storybook server. Usually this will be done with `yarn storybook`. You can run React and React Native storybook servers and tests simultaneously as long as they run on different ports. If you test against iOS simulator or Android emulator, these must also be running the storybook app, start them with `react-native run-ios` and `react-native run-android` respectively.

### 3. Create reference images

If it's your first time using loki you need to create the reference images to test your stories against. This is done with `yarn loki update` which by default will create a `loki` folder to store them in. These images should be checked into your git repository, optionally stored using [`git-lfs`](https://git-lfs.github.com). 

### 4. Make changes

Now it's time to make some changes to your stories or the underlying components that we want to catch with loki!

### 5. Run tests

Run loki again but this time in test mode with `yarn loki test`. You can test a subset of your configurations with a regular expression in the second argument. `yarn loki test laptop` will run any configuration containing the word `laptop`, therefore it's useful to add keywords such as platform (chrome, ios, android) to your configuration names. 

### 6. Review changes

Loki will create screenshots of all the tested stories in the `loki/current` folder in addition to a visual diff placed in the `loki/difference` folder. You can also use a specialized diffing tool such as [Kaleidoscope](https://www.kaleidoscopeapp.com). Make sure the changes are correct before you continue. 

### 7. Approve changes

If the changes were as you inteded, it's time to update the reference files. The test command should output a suggested command to use that will only update the failed tests. Otherwise just use the approve command; `yarn loki approve`. Commit your changes along with the new reference images and repeat.
