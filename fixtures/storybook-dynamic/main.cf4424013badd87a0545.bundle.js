(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "../../packages/browser/src/add-loki-session-marker.js":
/*!***************************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/add-loki-session-marker.js ***!
  \***************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const addLokiSessionMarker = window => {
  window.document.querySelector(':root').setAttribute('loki-test', true);
  /* eslint-disable no-underscore-dangle, no-param-reassign */
  window._isLokiTest = true;
};

module.exports = addLokiSessionMarker;


/***/ }),

/***/ "../../packages/browser/src/await-loki-ready.js":
/*!********************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/await-loki-ready.js ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const awaitLokiReady = window =>
  window.loki && window.loki.awaitReady && window.loki.awaitReady();

module.exports = awaitLokiReady;


/***/ }),

/***/ "../../packages/browser/src/configure-storybook.js":
/*!***********************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/configure-storybook.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* global window */
const {
  decorateStorybook,
  registerPendingPromise,
  resetPendingPromises,
  awaitReady,
} = __webpack_require__(/*! @loki/integration-core */ "../../packages/integration-core/src/index.js");

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      if (!window.loki) {
        window.loki = {};
      }
      window.loki.getStorybook = decorateStorybook(storybook);
      window.loki.registerPendingPromise = registerPendingPromise;
      window.loki.resetPendingPromises = resetPendingPromises;
      window.loki.awaitReady = awaitReady;
    }
  };
}

module.exports = createConfigurator;


/***/ }),

/***/ "../../packages/browser/src/disable-animations.js":
/*!**********************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/disable-animations.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* eslint no-param-reassign: ["error", { "props": false }] */

const disableAnimations = window => {
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
      callbacks.splice(0).forEach(c => c(now()));

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
        new Promise(resolve => {
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
  window.requestAnimationFrame = callback => {
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


/***/ }),

/***/ "../../packages/browser/src/disable-pointer-events.js":
/*!**************************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/disable-pointer-events.js ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const disablePointerEvents = window => {
  const DISABLE_POINTER_EVENTS_STYLE = `
  * {
    pointer-events: none !important;
  }
  `;

  // Disable pointer events to avoid having hover styles
  // for elements at the 0 by 0 position.
  window.document.addEventListener('DOMContentLoaded', () => {
    const styleElement = window.document.createElement('style');
    window.document.documentElement.appendChild(styleElement);
    styleElement.sheet.insertRule(DISABLE_POINTER_EVENTS_STYLE);
  });
};

module.exports = disablePointerEvents;


/***/ }),

/***/ "../../packages/browser/src/get-selector-box-size.js":
/*!*************************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/get-selector-box-size.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const getSelectorBoxSize = (window, selector) => {
  const isNotWrapperElement = (element, index, array) => {
    const isWrapper = array.some(node =>
      node === element ? false : element.contains(node)
    );
    return !isWrapper;
  };

  const isVisisble = element => {
    const style = window.getComputedStyle(element);

    return !(
      style.visibility === 'hidden' ||
      style.display === 'none' ||
      style.opacity === '0' ||
      ((style.width === '0px' || style.height === '0px') &&
        style.padding === '0px')
    );
  };

  const elements = Array.from(window.document.querySelectorAll(selector))
    .filter(isVisisble)
    .filter(isNotWrapperElement);

  if (elements.length === 0) {
    throw new Error('No visible elements found');
  }

  const getBoundingClientRect = element => element.getBoundingClientRect();

  const boxSizeUnion = (domRect, { x, y, width, height }) => {
    if (!domRect) {
      return { x, y, width, height };
    }

    const xMin = Math.min(domRect.x, x);
    const yMin = Math.min(domRect.y, y);

    const xMax = Math.max(domRect.x + domRect.width, x + width);
    const yMax = Math.max(domRect.y + domRect.height, y + height);

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    };
  };

  return elements.map(getBoundingClientRect).reduce(boxSizeUnion);
};

module.exports = getSelectorBoxSize;


/***/ }),

/***/ "../../packages/browser/src/get-stories.js":
/*!***************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/get-stories.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const getStories = window => {
  const getStorybook = window.loki && window.loki.getStorybook;
  if (!getStorybook) {
    throw new Error(
      "Loki addon not registered. Add `import 'loki/configure-react'` to your .storybook/preview.js file."
    );
  }
  return getStorybook().map(component => ({
    id: component.id,
    kind: component.kind,
    story: component.story,
  }));
};

module.exports = getStories;


/***/ }),

/***/ "../../packages/browser/src/index.js":
/*!*********************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/browser/src/index.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const addLokiSessionMarker = __webpack_require__(/*! ./add-loki-session-marker */ "../../packages/browser/src/add-loki-session-marker.js");
const awaitLokiReady = __webpack_require__(/*! ./await-loki-ready */ "../../packages/browser/src/await-loki-ready.js");
const createStorybookConfigurator = __webpack_require__(/*! ./configure-storybook */ "../../packages/browser/src/configure-storybook.js");
const disableAnimations = __webpack_require__(/*! ./disable-animations */ "../../packages/browser/src/disable-animations.js");
const disablePointerEvents = __webpack_require__(/*! ./disable-pointer-events */ "../../packages/browser/src/disable-pointer-events.js");
const getSelectorBoxSize = __webpack_require__(/*! ./get-selector-box-size */ "../../packages/browser/src/get-selector-box-size.js");
const getStories = __webpack_require__(/*! ./get-stories */ "../../packages/browser/src/get-stories.js");

module.exports = {
  addLokiSessionMarker,
  awaitLokiReady,
  createStorybookConfigurator,
  disableAnimations,
  disablePointerEvents,
  getSelectorBoxSize,
  getStories,
};


/***/ }),

/***/ "../../packages/integration-core/src/decorate-storybook.js":
/*!*******************************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/integration-core/src/decorate-storybook.js ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* eslint object-shorthand: 0, prefer-arrow-callback: 0, no-var: 0, no-console: 0 */
// Diverge from regular rules here to not mess with UglifyJS

const readyStateManager = __webpack_require__(/*! ./ready-state-manager */ "../../packages/integration-core/src/ready-state-manager.js");

let warnedSkipDeprecation = false;
let warnedAsyncDeprecation = false;

function decorateStorybook(storybook) {
  const originalStoriesOf = storybook.storiesOf;

  function wrapWithSkipStory(add, kind, isDeprecatedCall) {
    return function skipStory(story, storyFn, parameters = {}) {
      if (isDeprecatedCall && !warnedSkipDeprecation) {
        warnedSkipDeprecation = true;
        console.warn(
          '[DEPRECATED] `.add.skip(...)` is deprecated. Please use `.lokiSkip(...)` instead.'
        );
      }

      return add(story, storyFn, {
        ...parameters,
        loki: {
          ...(parameters.loki || {}),
          skip: true,
        },
      });
    };
  }

  function wrapWithAsyncStory(add, isDeprecatedCall) {
    return function skipStory(story, storyFn, parameters) {
      if (isDeprecatedCall && !warnedAsyncDeprecation) {
        warnedAsyncDeprecation = true;
        console.warn(
          '[DEPRECATED] `.add.async(...)` is deprecated. Please use `.lokiAsync(...)` instead.'
        );
      }

      return add(
        story,
        function render(context) {
          var resolveAsyncStory = null;
          readyStateManager.resetPendingPromises();
          readyStateManager.registerPendingPromise(
            new Promise(function(resolve) {
              resolveAsyncStory = resolve;
            })
          );

          const done = function() {
            if (resolveAsyncStory) {
              resolveAsyncStory();
            }
            resolveAsyncStory = null;
          };

          return storyFn(Object.assign({ done: done }, context));
        },
        parameters
      );
    };
  }

  function storiesOf(kind, module) {
    const stories = originalStoriesOf(kind, module);
    stories.add.skip = wrapWithSkipStory(stories.add.bind(stories), kind, true);
    stories.add.async = wrapWithAsyncStory(stories.add.bind(stories), true);
    stories.add.async.skip = wrapWithSkipStory(stories.add.async, kind, true);
    stories.add.skip.async = wrapWithAsyncStory(stories.add.skip, true);

    return stories;
  }

  // Monkey patch storiesOf to be able to add async/skip methods
  const descriptor = Object.getOwnPropertyDescriptor(storybook, 'storiesOf');
  if (descriptor.writable) {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    storybook.storiesOf = storiesOf;
  } else if (descriptor.configurable) {
    // In recent versions of storybook object this isn't writeable, probably due to babel transpilation changes
    Object.defineProperty(storybook, 'storiesOf', {
      configurable: true,
      enumerable: true,
      get: function() {
        return storiesOf;
      },
    });
  }

  storybook.setAddon({
    lokiSkip: function(...args) {
      return wrapWithSkipStory(this.add.bind(this), this.kind)(...args);
    },
    lokiAsync: function(...args) {
      return wrapWithAsyncStory(this.add.bind(this))(...args);
    },
    lokiAsyncSkip: function(...args) {
      return wrapWithSkipStory(
        wrapWithAsyncStory(this.add.bind(this)),
        this.kind
      )(...args);
    },
  });

  function getStorybook() {
    return storybook
      .raw()
      .filter(
        ({ parameters }) =>
          !parameters || !parameters.loki || !parameters.loki.skip
      );
  }

  return getStorybook;
}

module.exports = decorateStorybook;


/***/ }),

/***/ "../../packages/integration-core/src/index.js":
/*!******************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/integration-core/src/index.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const decorateStorybook = __webpack_require__(/*! ./decorate-storybook */ "../../packages/integration-core/src/decorate-storybook.js");
const readyStateManager = __webpack_require__(/*! ./ready-state-manager */ "../../packages/integration-core/src/ready-state-manager.js");

module.exports = Object.assign(
  {
    decorateStorybook,
  },
  readyStateManager
);


/***/ }),

/***/ "../../packages/integration-core/src/ready-state-manager.js":
/*!********************************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/integration-core/src/ready-state-manager.js ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* eslint prefer-arrow-callback: 0, no-var: 0, object-shorthand: 0 */
// Diverge from rules for UglifyJS

var pendingPromises = [];

function registerPendingPromise(promise) {
  pendingPromises.push(promise);
}

function resetPendingPromises() {
  pendingPromises = [];
}

function awaitReady() {
  return Promise.all(pendingPromises.splice(0)).then(function() {
    if (pendingPromises.length) {
      return awaitReady();
    }
    return true;
  });
}

module.exports = {
  registerPendingPromise: registerPendingPromise,
  resetPendingPromises: resetPendingPromises,
  awaitReady: awaitReady,
};


/***/ }),

/***/ "../../packages/integration-react/src/configure-storybook-react.js":
/*!***************************************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/integration-react/src/configure-storybook-react.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const storybook = __webpack_require__(/*! @storybook/react */ "../../node_modules/@storybook/react/dist/client/index.js");
const { createStorybookConfigurator } = __webpack_require__(/*! @loki/browser */ "../../packages/browser/src/index.js");

module.exports = createStorybookConfigurator(storybook);


/***/ }),

/***/ "../../packages/integration-react/src/index.js":
/*!*******************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/integration-react/src/index.js ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const configureStorybookReact = __webpack_require__(/*! ./configure-storybook-react */ "../../packages/integration-react/src/configure-storybook-react.js");

module.exports = configureStorybookReact;


/***/ }),

/***/ "../../packages/loki/configure-react.js":
/*!************************************************************************!*\
  !*** /Users/joel.arvidsson/Code/loki/packages/loki/configure-react.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! @loki/integration-react */ "../../packages/integration-react/src/index.js")();


/***/ }),

/***/ "./.storybook/generated-entry.js":
/*!***************************************!*\
  !*** ./.storybook/generated-entry.js ***!
  \***************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _storybook_react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @storybook/react */ "./node_modules/@storybook/react/dist/client/index.js");
/* harmony import */ var _storybook_react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_storybook_react__WEBPACK_IMPORTED_MODULE_0__);

module._StorybookPreserveDecorators = true;
Object(_storybook_react__WEBPACK_IMPORTED_MODULE_0__["configure"])([__webpack_require__("./src sync recursive ^\\.\\/(?:(?:(?!\\.)(?:(?:(?!(?:|\\/)\\.).)*?)\\/)?(?!\\.)(?=.)[^\\/]*?\\.stories\\.js\\/?)$")], module);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ "./node_modules/webpack/buildin/harmony-module.js")(module)))

/***/ }),

/***/ "./.storybook/preview.js":
/*!*******************************!*\
  !*** ./.storybook/preview.js ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var loki_configure_react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! loki/configure-react */ "../../packages/loki/configure-react.js");
/* harmony import */ var loki_configure_react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(loki_configure_react__WEBPACK_IMPORTED_MODULE_0__);


/***/ }),

/***/ "./src sync recursive ^\\.\\/(?:(?:(?!\\.)(?:(?:(?!(?:|\\/)\\.).)*?)\\/)?(?!\\.)(?=.)[^\\/]*?\\.stories\\.js\\/?)$":
/*!****************************************************************************************************!*\
  !*** ./src sync ^\.\/(?:(?:(?!\.)(?:(?:(?!(?:|\/)\.).)*?)\/)?(?!\.)(?=.)[^\/]*?\.stories\.js\/?)$ ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./stories/0-Welcome.stories.js": "./src/stories/0-Welcome.stories.js",
	"./stories/1-Button.stories.js": "./src/stories/1-Button.stories.js"
};


function webpackContext(req) {
	var id = webpackContextResolve(req);
	return __webpack_require__(id);
}
function webpackContextResolve(req) {
	if(!__webpack_require__.o(map, req)) {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	}
	return map[req];
}
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "./src sync recursive ^\\.\\/(?:(?:(?!\\.)(?:(?:(?!(?:|\\/)\\.).)*?)\\/)?(?!\\.)(?=.)[^\\/]*?\\.stories\\.js\\/?)$";

/***/ }),

/***/ "./src/stories/0-Welcome.stories.js":
/*!******************************************!*\
  !*** ./src/stories/0-Welcome.stories.js ***!
  \******************************************/
/*! exports provided: default, ToStorybook */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ToStorybook", function() { return ToStorybook; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _storybook_addon_links__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @storybook/addon-links */ "./node_modules/@storybook/addon-links/dist/index.js");
/* harmony import */ var _storybook_addon_links__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_storybook_addon_links__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @storybook/react/demo */ "./node_modules/@storybook/react/demo.js");
/* harmony import */ var _storybook_react_demo__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__);
var _jsxFileName = "/Users/joel.arvidsson/Code/loki/examples/react/src/stories/0-Welcome.stories.js";



/* harmony default export */ __webpack_exports__["default"] = ({
  title: 'Welcome',
  component: _storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__["Welcome"]
});
const ToStorybook = () => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__["Welcome"], {
  showApp: Object(_storybook_addon_links__WEBPACK_IMPORTED_MODULE_1__["linkTo"])('Button'),
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 10,
    columnNumber: 34
  }
});
ToStorybook.displayName = "ToStorybook";
ToStorybook.story = {
  name: 'to Storybook'
};
ToStorybook.__docgenInfo = {
  "description": "",
  "methods": [],
  "displayName": "ToStorybook"
};

if (typeof STORYBOOK_REACT_CLASSES !== "undefined") {
  STORYBOOK_REACT_CLASSES["src/stories/0-Welcome.stories.js"] = {
    name: "ToStorybook",
    docgenInfo: ToStorybook.__docgenInfo,
    path: "src/stories/0-Welcome.stories.js"
  };
}

/***/ }),

/***/ "./src/stories/1-Button.stories.js":
/*!*****************************************!*\
  !*** ./src/stories/1-Button.stories.js ***!
  \*****************************************/
/*! exports provided: default, Text, Emoji */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Text", function() { return Text; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Emoji", function() { return Emoji; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @storybook/addon-actions */ "../../node_modules/@storybook/addon-actions/dist/index.js");
/* harmony import */ var _storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @storybook/react/demo */ "./node_modules/@storybook/react/demo.js");
/* harmony import */ var _storybook_react_demo__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__);
var _jsxFileName = "/Users/joel.arvidsson/Code/loki/examples/react/src/stories/1-Button.stories.js";



/* harmony default export */ __webpack_exports__["default"] = ({
  title: 'Button',
  component: _storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__["Button"]
});
const Text = () => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__["Button"], {
  onClick: Object(_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1__["action"])('clicked'),
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 10,
    columnNumber: 27
  }
}, "Hello Button");
Text.displayName = "Text";
const Emoji = () => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_storybook_react_demo__WEBPACK_IMPORTED_MODULE_2__["Button"], {
  onClick: Object(_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_1__["action"])('clicked'),
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 13,
    columnNumber: 3
  }
}, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {
  role: "img",
  "aria-label": "so cool",
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 14,
    columnNumber: 5
  }
}, "\uD83D\uDE00 \uD83D\uDE0E \uD83D\uDC4D \uD83D\uDCAF"));
Emoji.displayName = "Emoji";
Text.__docgenInfo = {
  "description": "",
  "methods": [],
  "displayName": "Text"
};

if (typeof STORYBOOK_REACT_CLASSES !== "undefined") {
  STORYBOOK_REACT_CLASSES["src/stories/1-Button.stories.js"] = {
    name: "Text",
    docgenInfo: Text.__docgenInfo,
    path: "src/stories/1-Button.stories.js"
  };
}

Emoji.__docgenInfo = {
  "description": "",
  "methods": [],
  "displayName": "Emoji"
};

if (typeof STORYBOOK_REACT_CLASSES !== "undefined") {
  STORYBOOK_REACT_CLASSES["src/stories/1-Button.stories.js"] = {
    name: "Emoji",
    docgenInfo: Emoji.__docgenInfo,
    path: "src/stories/1-Button.stories.js"
  };
}

/***/ }),

/***/ 0:
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** multi ./node_modules/@storybook/core/dist/server/common/polyfills.js ./node_modules/@storybook/core/dist/server/preview/globals.js ./.storybook/preview.js ./.storybook/generated-entry.js /Users/joel.arvidsson/Code/loki/node_modules/webpack-hot-middleware/client.js?reload=true&quiet=true ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! /Users/joel.arvidsson/Code/loki/examples/react/node_modules/@storybook/core/dist/server/common/polyfills.js */"./node_modules/@storybook/core/dist/server/common/polyfills.js");
__webpack_require__(/*! /Users/joel.arvidsson/Code/loki/examples/react/node_modules/@storybook/core/dist/server/preview/globals.js */"./node_modules/@storybook/core/dist/server/preview/globals.js");
__webpack_require__(/*! /Users/joel.arvidsson/Code/loki/examples/react/.storybook/preview.js */"./.storybook/preview.js");
__webpack_require__(/*! /Users/joel.arvidsson/Code/loki/examples/react/.storybook/generated-entry.js */"./.storybook/generated-entry.js");
module.exports = __webpack_require__(/*! /Users/joel.arvidsson/Code/loki/node_modules/webpack-hot-middleware/client.js?reload=true&quiet=true */"../../node_modules/webpack-hot-middleware/client.js?reload=true&quiet=true");


/***/ }),

/***/ 1:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 2:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 3:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 4:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 5:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

},[[0,"runtime~main","vendors~main"]]]);
//# sourceMappingURL=main.cf4424013badd87a0545.bundle.js.map