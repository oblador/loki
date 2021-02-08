const disableInputCaret = (window) => {
  const DISABLE_INPUT_CARET_STYLE = `
  * {
    caret-color: transparent !important;
  }
  `;

  // Make blinking input carets transparent to avoid flakiness.
  window.document.addEventListener('DOMContentLoaded', () => {
    const styleElement = window.document.createElement('style');
    window.document.documentElement.appendChild(styleElement);
    styleElement.sheet.insertRule(DISABLE_INPUT_CARET_STYLE);
  });
};

module.exports = disableInputCaret;
