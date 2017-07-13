<img src="https://user-images.githubusercontent.com/378279/27998811-43b9906e-6515-11e7-835a-6f596506cc46.png" width="300" height="130" class="center" alt="Loki" />

<h1 class="center">Visual Regression Testing for Storybook</h1>

<img src="https://user-images.githubusercontent.com/378279/28074070-f0052fac-6657-11e7-8a9d-398a12d2d6a8.png" width="672" height="494" class="center" alt="" />

## Rationale

There's a few visual regression tools for the web, but most either cannot be run headless or use phantomjs which is deprecated and a browser nobody is _actually_ using. They generally also require you to maintain fixtures and/or only support one platform. 

## Aims

* Easy setup
* No additional maintenance cost
* Reproducible tests independent of OS
* Support all platforms storybook does

## Supported platforms

* Chrome in docker (recommended)
* Local Chrome application
* iOS simulator
* Android emulator
