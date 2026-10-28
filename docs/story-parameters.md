---
id: story-parameters
title: Story parameters
---

You can pass a `loki` parameter to a story to skip it or customize its Chrome rendering. If you are using Component Story Format (CSF), it would look like the following:

```js
export const MyStory = () => <MyComponent />;

MyStory.parameters = {
  loki: {
    width: 800,
    height: 600,
    chromeSelector: '#my-component',
  },
};
```

For object stories (CSF 3), set `parameters` on the story object instead:

```js
export const MyStory = {
  parameters: {
    loki: { width: 800, height: 600 },
  },
};
```

## `skip`

Set `skip: true` to exclude the story from every configuration and target. See [Skipping Tests](flaky-tests.md#skipping-tests) for examples.

## Chrome options

These options apply to `chrome.app`, `chrome.docker`, and `chrome.aws-lambda`. See the [configuration reference](configuration.md#configurations) for their types.

| Parameter                        | Description                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| `width`, `height`                | Browser viewport dimensions in CSS pixels.                                  |
| `deviceScaleFactor`              | Pixel density multiplier.                                                   |
| `mobile`                         | Enable mobile device emulation.                                             |
| `userAgent`                      | Custom user agent.                                                          |
| `media`                          | CSS media type to emulate, such as `print`.                                 |
| `features`                       | CSS media features to emulate.                                              |
| `clearBrowserCookies`            | Clear cookies before loading the story.                                     |
| `fetchFailIgnore`                | Case-insensitive regular expression matching failed request URLs to ignore. |
| `chromeEnableAnimations`         | Enable CSS transitions and animations.                                      |
| `chromeRetries`                  | Number of retries for a failed screenshot capture.                          |
| `disableAutomaticViewportHeight` | Keep the viewport height fixed when content extends below it.               |
| `chromeSelector`                 | CSS selector for the part of the page to capture.                           |

## Precedence

Story settings override configuration settings. **A configuration's preset takes priority** for any fields it defines.

For example, if a story sets `width: 800`:

| Configuration        | Viewport width           |
| -------------------- | ------------------------ |
| No preset            | `800px`                  |
| `preset: 'iPhone 7'` | `375px`, from the preset |

When the story omits an option, Loki uses the configuration's value. `media` and `fetchFailIgnore` also fall back to global `chromeEmulatedMedia` and `fetchFailIgnore`.

For `chromeSelector`, Loki uses the first non-empty value: **story → configuration → global**.

Set `preset` in the configuration and `chromeTolerance` globally.
