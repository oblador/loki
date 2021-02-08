const disablePointerEvents = (window) => {
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
