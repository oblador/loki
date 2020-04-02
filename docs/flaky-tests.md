---
id: flaky-tests
title: Handling Flaky Tests
---

## Skipping Tests

In some cases having a story of a component is useful for development purposes, but might be acceptable not to be covered by visual regression tests such as an animated GIF that cannot accurately be covered with a single screenshot. In those cases you can opt out by passing setting `skip: true` in the `loki` parameter:

```js
storiesOf('MyComponent', module)
  .add('enabled story', () => <MyComponent />)
  .add('skipped story', () => <MyComponent />, { loki: { skip: true } });
```

## Asynchronous Stories

Some components will do some computing or loading data over the network and then re-render. This can cause flaky tests and incorrect screenshots. Loki handles most cases of network traffic and loading images, but for other cases you can mark your story as async and tell loki when you're done via the `context.done` function:

```js
storiesOf('MyComponent', module)
  .add('synchronous story', () => <MyComponent />)
  .lokiAsync('asynchronous story', ({ done }) => <MyComponent onDone={done} />);
```

## Transitions and Animations

Animations cause the your component to be highly time sensitive and unless conditions are _exactly_ the same for each test instance they will yield different screenshots. Loki takes care of the most common web transitions out of the box by disabling CSS transitions/animations and `requestAnimationFrame`. The screenshot will be paused at the end state of the transition. To disable this use the `chromeEnableAnimations` option.

However known limitations include:

- Looped `requestAnimationFrame` animations
- GIFs
- SVG animations
- Native Lottie animations
- React Native `Animated` library

It's up to you to disable these kind of animations. A simple way would be to use context with [`recompose`](https://github.com/acdlite/recompose):

```js
// .storybook/config.js or storybook/storybook.js
import { addDecorator } from '@storybook/react';
import React, { Children } from 'react';
import PropTypes from 'prop-types';
import { withContext } from 'recompose';

const DisabledAnimationsProvider = withContext(
  { disableAnimations: PropTypes.bool },
  () => ({ disableAnimations: true })
)(({ children }) => Children.only(children));

const withDisabledAnimations = getStory =>
  <DisabledAnimationsProvider>{getStory()}</DisabledAnimationsProvider>;

addDecorator(withDisabledAnimations);

// MyComponent.js
import { getContext } from 'recompose';

const MyComponent = ({ disableAnimations }) => (
  disableAnimations
  ? /* Something without animations */
  : /* Something with animations */
)

export default getContext({
  disableAnimations: PropTypes.bool,
})(MyComponent);
```
