/* eslint no-param-reassign: ["error", { "props": false }] */

const disableAnimations = (window) => {
  const DISABLE_CSS_ANIMATIONS_STYLE = `
  *, :before, :after {
    -webkit-transition: none !important;
    transition: none !important;
    -webkit-animation: none !important;
    animation: none !important;
    will-change: auto !important;
  }
  `;

  let currentFrame = 1;
  const frameDuration = 16;
  const maxFrames = 1000;
  let resolveRAF;
  let resolveRAFTimer;
  const callbacks = [];

  // Speed up with 10x, but beware stepping too fast might cause
  // react-motion to pause them instead.
  const now = () => currentFrame * 10 * frameDuration;

  // In the case of multiple concurrent animations we want to
  // advance them together just like rAF would.
  const scheduleFrame = () => {
    setTimeout(() => {
      currentFrame++;
      callbacks.splice(0).forEach((c) => c(now()));

      // Assume no new invocations for 50ms means we've ended
      resolveRAFTimer = setTimeout(() => {
        resolveRAF();
        resolveRAF = null;
        resolveRAFTimer = null;
      }, 50);
    }, 0);

    // Defer screenshotting until animations has ended/stabilized
    if (!resolveRAF) {
      window.loki.registerPendingPromise(
        new Promise((resolve) => {
          resolveRAF = resolve;
        })
      );
    }

    if (resolveRAFTimer) {
      clearTimeout(resolveRAFTimer);
      resolveRAFTimer = null;
    }
  };

  // Monkey patch rAF to resolve immediately. This makes JS
  // based animations run until the end within a few milliseconds.
  // In case they run infinitely or more than 1000 frames/16 "seconds",
  // we just force them to a pause.
  window.requestAnimationFrame = (callback) => {
    // Avoid infinite loop by only allowing 1000 frames
    if (currentFrame < maxFrames) {
      callbacks.push(callback);
      if (callbacks.length === 1) {
        scheduleFrame();
      }
    }
    return -1;
  };

  // For implementations of JS transitions that don't use the rAF
  // timestamp callback argument, we need to monkey patch `performance.now`
  // too. Potentially need to include `Date.now` in the future.
  window.performance.now = now;

  // Disable CSS animations/transitions by forcing style.
  // Potentially not effective enough if `!important` is used
  // elsewhere in the story stylesheet/inline CSS.
  window.document.addEventListener('DOMContentLoaded', () => {
    const styleElement = window.document.createElement('style');
    window.document.documentElement.appendChild(styleElement);
    styleElement.sheet.insertRule(DISABLE_CSS_ANIMATIONS_STYLE);
  });
};

module.exports = disableAnimations;
